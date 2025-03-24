import SimpleSchema, { SimpleSchemaDefinition } from 'simpl-schema';
import type {
  FieldToCalculate, CalculatedOnlyField
} from '/imports/api/properties/subSchemas/computedField';
import type {
  InlineCalculationFieldToCompute, ComputedOnlyInlineCalculationField
} from '/imports/api/properties/subSchemas/inlineCalculationField';
import type { Simplify } from 'type-fest';

// It DOES NOT support a constructor with multiple schemas.
export type Definition = Exclude<SimpleSchemaDefinition, any[]>;

// This is a no-op wrapper, effectively implementing a phantom type.
export class TypedSimpleSchema<T> extends SimpleSchema {
  private constructor(definition: Definition) {
    super(definition);
  }
  static from<D extends Definition>(definition: D): TypedSimpleSchema<InferSchema<D>> {
    return new TypedSimpleSchema(definition);
  }
  clean(...args: Parameters<SimpleSchema['clean']>): unknown {
    return super.clean(...args);
  }
  // Extending the schema with another schema &'s their definitions
  // In some cases, this is not strictly accurate, use with caution
  extend<U>(otherSchema: TypedSimpleSchema<U>): TypedSimpleSchema<Simplify<T & U>> {
    return super.extend(otherSchema);
  }
}

// Assertions cannot be methods due to https://github.com/microsoft/TypeScript/issues/36931.
export function validate<T>(schema: TypedSimpleSchema<T>, value: unknown): asserts value is T {
  schema.validate(value);
}

export function cleanAndValidate<T extends { _id?: string }>(schema: TypedSimpleSchema<T>, doc: Partial<T>): T {
  const cleanDoc = schema.clean(doc);
  validate(schema, cleanDoc);
  return cleanDoc;
}

// If this type emerges anywhere in calculations, congratulations!
// You've just hit an unimplemented corner case :D
type NotImplementedMarker = { readonly NotImplementedMarker: unique symbol };

// Internal calculation markers.
type ArrayMarker = { readonly ArrayMarker: unique symbol };
type ObjectMarker = { readonly ObjectMarker: unique symbol };

export type InferType<T> = T extends TypedSimpleSchema<infer X> ? X : never;

// Infer TypeScript type from SimpleSchema type.
type InferTypeInner<T> =
  T extends typeof Array ? ArrayMarker :
  T extends typeof Boolean ? boolean :
  // eslint-disable-next-line @typescript-eslint/ban-types
  T extends typeof Function ? Function :
  T extends typeof Number ? number :
  T extends typeof SimpleSchema.Integer ? number :
  T extends typeof Object ? ObjectMarker :
  T extends typeof String ? string :
  T extends typeof Date ? Date :
  T extends RegExp ? string :
  T extends TypedSimpleSchema<infer U> ? U :
  NotImplementedMarker;

// Infer TypeScript type from a single field definition.
export type InferField<Def extends Definition, Key extends keyof Def> =
  Key extends string
  ? Def[Key] extends { type: infer Typ }
  ? ArrayMarker extends InferTypeInner<Typ>
  ? Array<InferField<Def, `${Key}.$`>>
  : ObjectMarker extends InferTypeInner<Typ>
  ? MakeUndefinedOptional<{ [L in keyof Def as L extends `${Key}.${infer SubKey}` ? SubKey extends `${string}.${string}` ? never : SubKey : never]: InferOptional<Def, L, InferField<Def, L>> }>
  : Def[Key] extends { allowedValues: infer Allowed extends string[] } ? InferOptional<Def, Key, InferEnum<Allowed>>
  : Def[Key] extends { type: 'fieldToCompute' } ? FieldToCalculate
  : Def[Key] extends { type: 'computedOnlyField' } ? CalculatedOnlyField
  : Def[Key] extends { type: 'inlineCalculationFieldToCompute' } ? InlineCalculationFieldToCompute
  : Def[Key] extends { type: 'computedOnlyInlineCalculationField' } ? ComputedOnlyInlineCalculationField
  : InferOptional<Def, Key, InferTypeInner<Typ>>
  : NotImplementedMarker
  : NotImplementedMarker

// Infer union from string array (allowedValues should me marked as const for this to work)
type InferEnum<T extends string[]> = T[number];

// Infer optional from optional field
type InferOptional<Def, Key extends keyof Def, U> = Def[Key] extends { optional: true } ? U | undefined : U;

type MakeUndefinedOptional<Type> = Simplify<{
  [Property in keyof Type as undefined extends Type[Property] ? never : Property]: Type[Property];
} & {
  [Property in keyof Type as undefined extends Type[Property] ? Property : never]?: Type[Property];
}>;

// Infer TypeScript type from a schema definition.
export type InferSchema<Def extends Definition> = MakeUndefinedOptional<InferField<
  { '': { type: typeof Object } }
  & { [Key in keyof Def as Key extends string ? `.${Key}` : never]: Def[Key] }, ''
>>;

export type ConvertToUnion<T> = T[keyof T];
