import constant from './constant.js';

const accessor = {
  create({name, path}) {
    return {
      parseType: 'accessor',
      path,
      name,
    };
  },
  compile(node, scope, context){
    let value = scope && scope[node.name];
    // For objects, get their value
    node.path.forEach(name => {
      if (value === undefined) return;
      value = value[name];
    });
    let valueType = typeof value;
    if (valueType === 'string' || valueType === 'number' || valueType === 'boolean'){
      return {
        result: constant.create({
          value,
          valueType
        }),
        context,
      };
    } else if (valueType === 'undefined'){
      return {
        result: accessor.create({
          name: node.name,
          path: node.path,
        }),
        context,
      };
    } else {
      context.error(`${node.name} returned an unexpected type`);
      return {
        result: accessor.create({
          name: node.name,
          path: node.path,
        }),
        context,
      };
    }
  },
  reduce(node, scope, context){
    let { result } = accessor.compile(node, scope, context);
    if (result.parseType === 'accessor'){
      context.error(`${accessor.toString(result)} not found, set to 0`);
      return {
        result: constant.create({
          value: 0,
        }),
        context
      };
    } else {
      return {result, context};
    }
  },
  toString(node){
    return `${node.name}.${node.path.join('.')}`;
  }
}

export default accessor;
