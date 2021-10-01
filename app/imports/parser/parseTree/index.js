import resolve, {traverse, toString, mergeResolvedNodes} from '../resolve';

const index = {
  create({array, index}) {
		return {
      type: 'index',
      array,
      index,
    }
  },
  resolve(fn, node, scope){
    let index, array, rest;
    let resolved = {};
    ({result: index, ...rest} = resolve(fn, node.index, scope));
    mergeResolvedNodes(resolved, rest);
    ({result: array, ...rest} = resolve(fn, node.array, scope));
    mergeResolvedNodes(resolved, rest);

    if (
      index.valueType === 'number' &&
      Number.isInteger(index.value) &&
      array.type === 'array'
    ){
      if (index.value < 1 || index.value > array.values.length){
        mergeResolvedNodes(resolved, {
          errors: [{
            type: 'warning',
            message: `Index of ${index.value} is out of range for an array` +
              ` of length ${array.values.length}`,
          }]
        });
      }
      let selection = array.values[index.value - 1];
      if (selection){
        let result;
        ({result, ...rest} = resolve(fn, selection, scope));
        mergeResolvedNodes(resolved, rest)
        return result;
      }
    } else if (fn === 'reduce'){
      if (!(array instanceof ArrayNode)){
        return new ErrorNode({
          node: node,
          error: 'Can not get the index of a non-array node: ' +
            node.array.toString() + ' = ' + array.toString(),
          context,
        });
      } else if (!index.isInteger){
        return new ErrorNode({
          node: node,
          error: array.toString() + ' is not an integer index of the array',
          context,
        });
      }
    }
    return new IndexNode({
      index,
      array,
      previousNodes: [node],
    });
  },
  toString(){
    return `${node.array.toString()}[${node.index.toString()}]`;
  },
  traverse(fn){
    fn(node);
    node.array.traverse(fn);
    node.index.traverse(fn);
  },
  replaceChildren(fn){
    node.array = node.array.replaceNodes(fn);
    node.index = node.index.replaceNodes(fn);
  }
}

export default index;
