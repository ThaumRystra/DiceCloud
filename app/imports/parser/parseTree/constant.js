const constant = {
  create({value}){
    return {
      parseType: 'constant',
      valueType: typeof value,
      value,
    }
  },
  compile(node, scope, context){
    return {result: node, context};
  },
  toString(node){
    return `${node.value}`;
  },
}

export default constant;
