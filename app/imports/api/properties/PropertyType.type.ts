import propertySchemasIndex from './computedPropertySchemasIndex';

export type PropertyType = Exclude<keyof typeof propertySchemasIndex, 'any'>;
