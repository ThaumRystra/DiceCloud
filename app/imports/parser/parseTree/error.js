const error = {
  create({node, error}) {
    return {
      parseType: 'error',
      node,
      error,
    }
  },
  compile(node, scope, context){
    return {result: node, context};
  },
  toString(node){
    return node.error.toString();
  },
}

export default error;
