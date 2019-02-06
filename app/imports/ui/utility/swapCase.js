export function kebabToCamelCase(string){
  return string.replace(/-([a-z0-9])/g, g => g[1].toUpperCase());
};

export function camelToKebabCase(string){
  return string.replace(/([a-z][A-Z0-9])/g, g => g[0] + '-' + g[1].toLowerCase());
};
