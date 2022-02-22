import resolve, { toString } from '../resolve.js';
import constant from './constant.js';

const symbol = {
  create({name}){
    return {
      parseType: 'symbol',
      name,
    };
  },
  toString(node){
    return `${node.name}`
  },
  compile(node, scope, context, calledFromReduce = false){
    let value = scope && scope[node.name];
    let type = typeof value;
    // For objects, default to their .value
    if (type === 'object'){
      value = value.value;
      type = typeof value;
    }
    // For parse nodes, compile and return
    if (value?.parseType){
      if (calledFromReduce){
        return resolve('reduce', value, scope, context);
      } else {
        return resolve('compile', value, scope, context);
      }
    }
    if (type === 'string' || type === 'number' || type === 'boolean'){
      return {
        result: constant.create({value}),
        context,
      };
    } else if (type === 'undefined'){
      return {
        result: symbol.create({name: node.name}),
        context,
      };
    } else {
      throw new Meteor.Error(`Unexpected case: ${node.name} resolved to ${value}`);
    }
  },
  reduce(node, scope, context){
    let {result} = symbol.compile(node, scope, context, true);
    if (result.parseType === 'symbol'){
      context.error({
        type: 'info',
        message: `${toString(result)} not found, set to 0`
      });
      return {
        result: constant.create({value: 0}),
        context,
      };
    } else {
      return {result, context};
    }
  }
}

export default symbol;
