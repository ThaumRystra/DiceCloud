import { prettifyParseError, parse } from '/imports/parser/parser.js';
import ErrorNode from '/imports/parser/parseTree/ErrorNode.js';
import applyFnToKey from '/imports/api/creature/computation/newEngine/utility/applyFnToKey.js';

export default function parseCalculationFields(prop, schemas){
  // For each key in the schema
  schemas[prop.type]._schemaKeys.forEach( key => {
    //  that ends in '.calculation'
    if (key.slice(-12) === '.calculation'){
      const calcKey = key.sclice(0, -12);

      // Determine the level the calculation should compute down to
      let parseLevel = schemas[prop.type].getDefinition(calcKey).parseLevel;

      // For all fields matching they keys
      // supports `keys.$.with.$.arrays`
      applyFnToKey(prop, calcKey, calcObj => {
        // Store a reference to all the calculations
        prop._computationDetails.calculations.push(calcObj);
        // Store the level to compute down to later
        calcObj._parseLevel = parseLevel;
        // Parse the calculation
        parseCalculation(calcObj);
      });
      // Or that ends in .inlineCalculations
    } else if (key.slice(-19) === '.inlineCalculations'){
      const inlineCalcKey = key.sclice(0, -19);
      applyFnToKey(prop, inlineCalcKey, inlineCalcObj => {
        // Store a reference to all the inline calculations
        prop._computationDetails.inlineCalculations.push(inlineCalcObj);
      });
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
