const constant = {
  create({value, valueType}){
    if (!valueType) throw `Expected valueType to be set, got ${valueType}`
    return {
      type: 'constant',
      valueType,
      value,
    }
  },
  compile(node){
    return node;
  },
  toString(node){
    return `${node.value}`;
  },
}

export default constant;
