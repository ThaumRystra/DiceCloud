import { ResolveLevel } from '/imports/parser/parseTree/NodeFactory';
import resolve from '/imports/parser/resolve'
import rollDice from '/imports/parser/rollDice';

export type ParserFunction = {
  comment: string;
  examples: { input: string, result: string }[];
  arguments: string[];
  maxResolveLevels?: ResolveLevel[];
  minArguments?: number,
  maxArguments?: number,
  resultType: string;
  fn: (...args: any[]) => any;
}

const parserFunctions: { [name: string]: ParserFunction } = {
  'abs': {
    comment: 'Returns the absolute value of a number',
    examples: [
      { input: 'abs(9)', result: '9' },
      { input: 'abs(-3)', result: '3' },
    ],
    arguments: ['number'],
    resultType: 'number',
    fn: Math.abs,
  },
  'sqrt': {
    comment: 'Returns the square root of a number',
    examples: [
      { input: 'sqrt(16)', result: '4' },
      { input: 'sqrt(10)', result: '3.1622776601683795' },
    ],
    arguments: ['number'],
    resultType: 'number',
    fn: Math.sqrt,
  },
  'max': {
    comment: 'Returns the largest of the given numbers',
    examples: [{ input: 'max(12, 6, 3, 168)', result: '168' }],
    arguments: anyNumberOf('number'),
    resultType: 'number',
    fn: Math.max,
  },
  'min': {
    comment: 'Returns the smallest of the given numbers',
    examples: [{ input: 'min(12, 6, 3, 168)', result: '3' }],
    arguments: anyNumberOf('number'),
    resultType: 'number',
    fn: Math.min,
  },
  'round': {
    comment: 'Returns the value of a number rounded to the nearest integer',
    examples: [
      { input: 'round(5.95)', result: '6' },
      { input: 'round(5.5)', result: '6' },
      { input: 'round(5.05)', result: '5' },
    ],
    arguments: ['number'],
    resultType: 'number',
    fn: Math.round,
  },
  'floor': {
    comment: 'Rounds a number down to the next smallest integer',
    examples: [
      { input: 'floor(5.95)', result: '5' },
      { input: 'floor(5.05)', result: '5' },
      { input: 'floor(5)', result: '5' },
      { input: 'floor(-5.5)', result: '-6' },
    ],
    arguments: ['number'],
    resultType: 'number',
    fn: Math.floor,
  },
  'ceil': {
    comment: 'Rounds a number up to the next largest integer',
    examples: [
      { input: 'ceil(5.95)', result: '6' },
      { input: 'ceil(5.05)', result: '6' },
      { input: 'ceil(5)', result: '5' },
      { input: 'ceil(-5.5)', result: '-5' },
    ],
    arguments: ['number'],
    resultType: 'number',
    fn: Math.ceil,
  },
  'trunc': {
    comment: 'Returns the integer part of a number by removing any fractional digits',
    examples: [
      { input: 'trunc(5.95)', result: '5' },
      { input: 'trunc(5.05)', result: '5' },
      { input: 'trunc(5)', result: '5' },
      { input: 'trunc(-5.5)', result: '-5' },
    ],
    arguments: ['number'],
    resultType: 'number',
    fn: Math.trunc,
  },
  'sign': {
    comment: 'Returns either a positive or negative 1, indicating the sign of a number, or zero',
    examples: [
      { input: 'sign(-3)', result: '-1' },
      { input: 'sign(3)', result: '1' },
      { input: 'sign(0)', result: '0' },
    ],
    arguments: ['number'],
    resultType: 'number',
    fn: Math.sign,
  },
  'tableLookup': {
    comment: 'Returns the index of the last value in the array that is less than the specified amount',
    examples: [
      { input: 'tableLookup([100, 300, 900], 457)', result: '2' },
      { input: 'tableLookup([100, 300, 900], 23)', result: '0' },
      { input: 'tableLookup([100, 300, 900, 1200], 900)', result: '3' },
      { input: 'tableLookup([100, 300], 594)', result: '2' },
    ],
    arguments: ['array', 'number'],
    resultType: 'number',
    fn: function tableLookup(arrayNode, number) {
      for (const i in arrayNode.values) {
        const node = arrayNode.values[i];
        if (node.value > number) return +i;
      }
      return arrayNode.values.length;
    }
  },
  'resolve': {
    comment: 'Forces the given calculation to resolve into a number, even in calculations where it would usually keep the unknown values as is',
    examples: [
      { input: 'resolve(someUndefinedVariable + 3 + 4)', result: '7' },
      { input: 'resolve(1d6)', result: '4' },
    ],
    arguments: ['parseNode'],
    resultType: 'parseNode',
    fn: async function resolveFn(node) {
      const { result } = await resolve('reduce', node, this.scope, this.context);
      return result;
    }
  },
  'dropLowest': {
    comment: 'Removes one or more of the lowest values in a roll',
    examples: [
    ],
    arguments: ['rollArray', 'number'],
    maxResolveLevels: ['roll', 'reduce'],
    minArguments: 1,
    maxArguments: 2,
    resultType: 'rollArray',
    fn: function dropLowestFn(rollArray, numberToDrop = 1) {
      // Create a new array where the values are sorted in ascending order 
      const sortedArray = [...rollArray.values].sort(function (a, b) {
        return a.value - b.value;
      });

      // mark the N smallest elements as dropped
      for (let i = 0; i < numberToDrop; i += 1) {
        sortedArray[i].disabled = true;
        sortedArray[i].disabledBy = 'dropLowest';
      }
      return rollArray;
    },
  },
  'dropHighest': {
    comment: 'Removes one or more of the highest values in a roll',
    examples: [
    ],
    arguments: ['rollArray', 'number'],
    maxResolveLevels: ['roll', 'reduce'],
    minArguments: 1,
    maxArguments: 2,
    resultType: 'rollArray',
    fn: function dropHighestFn(rollArray, numberToDrop = 1) {
      // Create a new array where the values are sorted in ascending order 
      const sortedArray = [...rollArray.values].sort(function (a, b) {
        return b.value - a.value;
      });

      // mark the N smallest elements as dropped
      for (let i = 0; i < numberToDrop; i += 1) {
        sortedArray[i].disabled = true;
        sortedArray[i].disabledBy = 'dropHighest';
      }
      return rollArray;
    },
  },
  'reroll': {
    comment: 'Rerolls if a number is less than or equal to the given value',
    examples: [
    ],
    arguments: ['rollArray', 'number', 'boolean'],
    maxResolveLevels: ['roll', 'reduce'],
    minArguments: 1,
    maxArguments: 3,
    resultType: 'rollArray',
    fn: function rerollFn(rollArray, numberToReroll = 1, keepNewRoll = false) {
      const rollValues = rollArray.values
      // Iterate through the roll values
      for (let i = 0; i < rollValues.length; i += 1) {
        // If the number is less than the reroll limit
        if (rollValues[i].value <= numberToReroll) {
          // Disable it
          rollValues[i].disabled = true;
          rollValues[i].disabledBy = 'reroll';
          // Roll it again, insert the new roll into the list at the next index
          rollValues.splice(i + 1, 0, {
            value: rollDice(1, rollArray.diceSize)[0],
          });
          // Skip iterating the inserted roll if we are forced to keep it
          if (keepNewRoll) {
            i += 1;
          }
        }
        if (i >= 100) {
          this.context.error('Can\'t roll more than 100 dice at once');
          return rollArray;
        }
      }
      return rollArray;
    },
  },
  'explode': {
    comment: 'Rerolls if a number is greater than or equal to the given value',
    examples: [
    ],
    arguments: ['rollArray', 'number', 'number'],
    maxResolveLevels: ['roll', 'reduce', 'reduce'],
    minArguments: 1,
    maxArguments: 3,
    resultType: 'rollArray',
    fn: function explodeFn(rollArray, depth = 1, numberToReroll = rollArray.diceSize) {
      let overflowErrored = false;
      if (depth > 99) depth = 99;
      const rollValues = rollArray.values
      // Iterate through the roll values
      for (let i = 0; i < rollValues.length; i += 1) {
        // If the number is greater than or equal to the reroll limit
        // And there is space to reroll it
        if (rollValues[i].value >= numberToReroll) {
          rollValues[i].bold = true;
          let explodeDepth = 1;
          let explodeRoll;
          do {
            // Before inserting this roll, make sure the total dice in the roll
            // Doesn't exceed 100
            if (rollValues.length >= 100) {
              if (!overflowErrored) {
                this.context.error('Can\'t roll more than 100 dice at once');
                overflowErrored = true;
              }
              break;
            }
            explodeDepth += 1;
            explodeRoll = rollDice(1, rollArray.diceSize)[0];
            const rollObj = {
              value: explodeRoll,
              italics: true,
            };
            // Insert the roll
            rollValues.splice(i + 1, 0, rollObj);
            i += 1;
          } while (explodeDepth <= depth && explodeRoll >= numberToReroll)
        }
      }
      return rollArray;
    },
  },
}

function anyNumberOf(type) {
  const argumentArray: any = [type];
  argumentArray.anyLength = true;
  return argumentArray;
}

export default parserFunctions;
