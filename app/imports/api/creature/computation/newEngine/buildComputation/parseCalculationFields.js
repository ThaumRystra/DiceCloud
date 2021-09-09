import { prettifyParseError, parse } from '/imports/parser/parser.js';
import ErrorNode from '/imports/parser/parseTree/ErrorNode.js';
import applyFnToKey from '/imports/api/creature/computation/newEngine/utility/applyFnToKey.js';

export default function parseCalculationFields(prop, schemas){
  // For each key in the schema
  schemas[prop.type]._schemaKeys.forEach( key => {
    //  that ends in '.calculation'
    if (key.slice(-12) !== '.calculation') return;
    const calcKey = key.sclice(0, -12);

    // For all fields matching they keys
    // supports `keys.$.with.$.arrays`
    applyFnToKey(prop, calcKey, calcObj => {
      // Store a reference to all the calculations
      prop._computationDetails.calculations.push(calcObj);
      // Parse the calculation
      parseCalculation(calcObj);
    });

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
