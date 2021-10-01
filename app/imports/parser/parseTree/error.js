const error = {
  create({node, error}) {
    return {
      type: 'error',
      node,
      error,
    }
  },
  compile(node){
    return node;
  },
  toString(node){
    return node.error.toString();
  },
}

export default error;
