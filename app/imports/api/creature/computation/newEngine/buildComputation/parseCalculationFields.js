import INLINE_CALCULATION_REGEX from '/imports/constants/INLINE_CALCULTION_REGEX.js';
import { prettifyParseError, parse } from '/imports/parser/parser.js';
import ErrorNode from '/imports/parser/parseTree/ErrorNode.js';
import applyFnToKey from '/imports/api/creature/computation/newEngine/utility/applyFnToKey.js';
import { get } from 'lodash';

export default function parseCalculationFields(prop, schemas){
  discoverInlineCalculationFields(prop, schemas);
  parseAllCalculationFields(prop, schemas);
}

function discoverInlineCalculationFields(prop, schemas){
  // For each key in the schema
  schemas[prop.type]._schemaKeys.forEach( key => {
    // That ends in .inlineCalculations
    if (key.slice(-19) === '.inlineCalculations'){
      const inlineCalcKey = key.slice(0, -19);
      applyFnToKey(prop, inlineCalcKey, (prop, key) => {
        const inlineCalcObj = get(prop, key);
        if (!inlineCalcObj) return;
        // Store a reference to all the inline calculations
        prop._computationDetails.inlineCalculations.push(inlineCalcObj);
        // Extract the calculations and store them on the property
        let string = inlineCalcObj.text;
        inlineCalcObj.inlineCalculations = [];
        let matches = string.matchAll(INLINE_CALCULATION_REGEX);
        for (let match of matches){
          let calculation = match[1];
          inlineCalcObj.inlineCalculations.push({
            calculation,
          });
        }
      });
    }
  });
}

function parseAllCalculationFields(prop, schemas){
  // For each key in the schema
  schemas[prop.type]._schemaKeys.forEach( key => {
    //  that ends in '.calculation'
    if (key.slice(-12) === '.calculation'){
      const calcKey = key.slice(0, -12);
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
      // Or that ends in .inlineCalculations
    }
  });
}

function parseCalculation(calcObj){
  let calculation = calcObj.calculation || '';
  try {
    calcObj._parsedCalculation = parse(calculation);
  } catch (e) {
    let error = prettifyParseError(e);
    calcObj.errors ?
      calcObj.errors.push(error) :
      calcObj.errors = [error];
    calcObj._parsedCalculation = new ErrorNode({error});
  }
}
