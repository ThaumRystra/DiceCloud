import ArrayNode from '/imports/parser/parseTree/ArrayNode.js';

export default {
  'abs': {
    comment: 'Returns the absolute value of a number',
    examples: [
      {input: 'abs(9)', result: '9'},
      {input: 'abs(-3)', result: '3'},
    ],
    arguments: ['number'],
    resultType: 'number',
    fn: Math.abs,
  },
  'sqrt': {
    comment: 'Returns the square root of a number',
    examples: [
      {input: 'sqrt(16)', result: '4'},
      {input: 'sqrt(10)', result: '3.1622776601683795'},
    ],
    arguments: ['number'],
    resultType: 'number',
    fn: Math.sqrt,
  },
  'max': {
    comment: 'Returns the largest of the given numbers',
    examples: [{input: 'max(12, 6, 3, 168)', result: '168'}],
    arguments: anyNumberOf('number'),
    resultType: 'number',
    fn: Math.max,
  },
  'min': {
    comment: 'Returns the smallest of the given numbers',
    examples: [{input: 'min(12, 6, 3, 168)', result: '3'}],
    arguments: anyNumberOf('number'),
    resultType: 'number',
    fn: Math.min,
  },
  'round': {
    comment: 'Returns the value of a number rounded to the nearest integer',
    examples: [
      {input: 'round(5.95)', result: '6'},
      {input: 'round(5.5)', result: '6'},
      {input: 'round(5.05)', result: '5'},
    ],
    arguments: ['number'],
    resultType: 'number',
    fn: Math.round,
  },
  'floor': {
    comment: 'Rounds a number down to the next smallest integer',
    examples: [
      {input: 'floor(5.95)', result: '5'},
      {input: 'floor(5.05)', result: '5'},
      {input: 'floor(5)', result: '5'},
      {input: 'floor(-5.5)', result: '-6'},
    ],
    arguments: ['number'],
    resultType: 'number',
    fn: Math.floor,
  },
  'ceil': {
    comment: 'Rounds a number up to the next largest integer',
    examples: [
      {input: 'ceil(5.95)', result: '6'},
      {input: 'ceil(5.05)', result: '6'},
      {input: 'ceil(5)', result: '5'},
      {input: 'ceil(-5.5)', result: '-5'},
    ],
    arguments: ['number'],
    resultType: 'number',
    fn: Math.ceil,
  },
  'trunc': {
    comment: 'Returns the integer part of a number by removing any fractional digits',
    examples: [
      {input: 'trunc(5.95)', result: '5'},
      {input: 'trunc(5.05)', result: '5'},
      {input: 'trunc(5)', result: '5'},
      {input: 'trunc(-5.5)', result: '-5'},
    ],
    arguments:[ 'number'],
    resultType: 'number',
    fn: Math.trunc,
  },
  'sign': {
    comment: 'Returns either a positive or negative 1, indicating the sign of a number, or zero',
    examples: [
      {input: 'sign(-3)', result: '-1'},
      {input: 'sign(3)', result: '1'},
      {input: 'sign(0)', result: '0'},
    ],
    arguments: ['number'],
    resultType: 'number',
    fn: Math.sign,
  },
  'tableLookup': {
    comment: 'Returns the index of the last value in the array that is less than the specified amount',
    examples: [
      {input: 'tableLookup([100, 300, 900], 457)', result: '2'},
      {input: 'tableLookup([100, 300, 900], 23)', result: '0'},
      {input: 'tableLookup([100, 300, 900, 1200], 900)', result: '3'},
      {input: 'tableLookup([100, 300], 594)', result: '2'},
    ],
    arguments: [ArrayNode, 'number'],
    resultType: 'number',
    fn: function tableLookup(arrayNode, number){
      for(let i in arrayNode.values){
        let node = arrayNode.values[i];
        if (node.value > number) return +i;
      }
      return arrayNode.values.length;
    }
  }
}

function anyNumberOf(type){
  let argumentArray = [type];
  argumentArray.anyLength = true;
  return argumentArray;
}
