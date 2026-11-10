import z from 'zod';
import type { ParseNode } from '/imports/parser/parseTree/ParseNode';
import { errorSchema } from '/imports/api/properties/subSchemas/error.schema';

export const calculationFieldSchema = z
  .object({
    calculation: z.string().default(''),
  })
  .optional()
  .meta({ type: 'calculationField' });

const ConstantValueSchema = z.union([z.number(), z.string(), z.boolean()]);

export const computedCalculationFieldSchema = z
  .object({
    ...calculationFieldSchema.unwrap().shape,
    value: ConstantValueSchema,
    valueNode: z.custom<ParseNode>(),
    effectIds: z.array(z.string().brand('CreaturePropertyId')),
    proficiencyIds: z.array(z.string().brand('CreaturePropertyId')),
    unaffected: ConstantValueSchema,
    parseNode: z.custom<ParseNode>(),
    hash: z.number(),
    advantage: z.number(),
    disadvantage: z.number(),
    fail: z.number(),
    conditional: z.array(z.string()),
    error: z.array(errorSchema),
  })
  .optional();

export type CalculationField = z.infer<typeof calculationFieldSchema>;
export type ComputedCalculationField = z.infer<
  typeof computedCalculationFieldSchema
>;
