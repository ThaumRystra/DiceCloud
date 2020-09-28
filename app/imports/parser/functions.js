export default {
  'abs': {
    comment: 'Returns the absolute value of a number',
    examples: [
      {input: 'abs(9)', result: '9'},
      {input: 'abs(-3)', result: '3'},
    ],
    argumentType: 'number',
    resultType: 'number',
    fn: Math.abs,
  },
  'sqrt': {
    comment: 'Returns the square root of a number',
    examples: [
      {input: 'sqrt(16)', result: '4'},
      {input: 'sqrt(10)', result: '3.1622776601683795'},
    ],
    argumentType: 'number',
    resultType: 'number',
    fn: Math.sqrt,
  },
  'max': {
    comment: 'Returns the largest of the given numbers',
    examples: [{input: 'min(12, 6, 3, 168)', result: '168'}],
    argumentType: 'number',
    resultType: 'number',
    fn: Math.max,
  },
  'min': {
    comment: 'Returns the smallest of the given numbers',
    examples: [{input: 'min(12, 6, 3, 168)', result: '3'}],
    argumentType: 'number',
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
    argumentType: 'number',
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
    argumentType: 'number',
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
    argumentType: 'number',
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
    argumentType: 'number',
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
    argumentType: 'number',
    resultType: 'number',
    fn: Math.sign,
  }
}
