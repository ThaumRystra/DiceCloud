import INLINE_CALCULATION_REGEX from '/imports/constants/INLINE_CALCULTION_REGEX.js';
import { prettifyParseError, parse } from '/imports/parser/parser.js';
import applyFnToKey from '/imports/api/engine/computation/utility/applyFnToKey.js';
import { get } from 'lodash';
import errorNode from '/imports/parser/parseTree/error.js'

export default function parseCalculationFields(prop, schemas){
  discoverInlineCalculationFields(prop, schemas);
  parseAllCalculationFields(prop, schemas);
}

function discoverInlineCalculationFields(prop, schemas){
  // For each key in the schema
  schemas[prop.type].inlineCalculationFields().forEach( calcKey => {
    // That ends in .inlineCalculations
    applyFnToKey(prop, calcKey, (prop, key) => {
      const inlineCalcObj = get(prop, key);
      if (!inlineCalcObj) return;
      // Store a reference to all the inline calculations
      prop._computationDetails.inlineCalculations.push(inlineCalcObj);
      // Extract the calculations and store them on the property
      let string = inlineCalcObj.text;
      if (!string) return;
      inlineCalcObj.inlineCalculations = [];
      let matches = string.matchAll(INLINE_CALCULATION_REGEX);
      for (let match of matches){
        let calculation = match[1];
        inlineCalcObj.inlineCalculations.push({
          calculation,
        });
      }
    });
  });
}

function parseAllCalculationFields(prop, schemas){
  // For each computed key in the schema
  schemas[prop.type].computedFields().forEach( calcKey => {
    // Determine the level the calculation should compute down to
    let parseLevel = schemas[prop.type].getDefinition(calcKey).parseLevel || 'reduce';

    // For all fields matching they keys
    // supports `keys.$.with.$.arrays`
    applyFnToKey(prop, calcKey, (prop, key) => {
      const calcObj = get(prop, key);
      if (!calcObj) return;
      // Store a reference to all the calculations
      prop._computationDetails.calculations.push(calcObj);
      // Store the level to compute down to later
      calcObj._parseLevel = parseLevel;
      // Parse the calculation
      parseCalculation(calcObj);
    });
  });
}

function parseCalculation(calcObj){
  if (!calcObj.calculation) return;
  try {
    calcObj._parsedCalculation = parse(calcObj.calculation);
  } catch (e) {
    let error = {
      type: 'evaluation',
      message: prettifyParseError(e),
    };
    calcObj.errors ?
      calcObj.errors.push(error) :
      calcObj.errors = [error];
    calcObj._parsedCalculation = errorNode.create({error});
  }
}
