import INLINE_CALCULATION_REGEX from '/imports/constants/INLINE_CALCULATION_REGEX';
import { prettifyParseError, parse } from '/imports/parser/parser';
import applyFnToKey from '/imports/api/engine/computation/utility/applyFnToKey';
import { get, set, unset } from 'lodash';
import errorNode from '/imports/parser/parseTree/error';
import cyrb53 from '/imports/api/engine/computation/utility/cyrb53';

export default function parseCalculationFields(prop, schemas) {
  discoverInlineCalculationFields(prop, schemas);
  parseAllCalculationFields(prop, schemas);
}

function discoverInlineCalculationFields(prop, schemas) {
  // For each key in the schema
  schemas[prop.type]?.inlineCalculationFields?.()?.forEach(calcKey => {
    // That ends in .inlineCalculations
    applyFnToKey(prop, calcKey, (prop, key) => {
      const inlineCalcObj = get(prop, key);
      if (!inlineCalcObj) return;
      // Store a reference to all the inline calculations
      prop._computationDetails.inlineCalculations.push(inlineCalcObj);
      // Extract the calculations and store them on the property
      let string = inlineCalcObj.text;
      // If there is no text, delete the whole field
      if (!string) {
        unset(prop, calcKey);
        return;
      }

      // Set the value to the uncomputed string for use in calculations
      inlineCalcObj.value = string;

      // Has the text, if it matches the existing hash, stop
      const inlineCalcHash = cyrb53(inlineCalcObj.text);
      if (inlineCalcHash === inlineCalcObj.hash) {
        return;
      }
      inlineCalcObj.hash = inlineCalcHash;
      inlineCalcObj.inlineCalculations = [];

      // It will be re set including the embedded calculation at the end of
      // the computation
      let matches = string.matchAll(INLINE_CALCULATION_REGEX);
      for (let match of matches) {
        let calculation = match[1];
        inlineCalcObj.inlineCalculations.push({
          calculation,
        });
      }
    });
  });
}

function parseAllCalculationFields(prop, schemas) {
  // For each computed key in the schema
  schemas[prop.type]?.computedFields?.()?.forEach(calcKey => {
    // Determine the level the calculation should compute down to
    let parseLevel = schemas[prop.type].getDefinition(calcKey).parseLevel || 'compile';

    // Special case of effects, when targeting by tags compile
    if (prop.type === 'effect' && prop.targetByTags) parseLevel = 'compile';

    // For all fields matching they keys
    // supports `keys.$.with.$.arrays`
    applyFnToKey(prop, calcKey, (prop, key) => {
      let calcObj = get(prop, key);
      // Create a calculation object if one doesn't exist, it will get deleted again later if
      // it's not used, but if an effect targets a calculated field, we should have one to target
      if (
        !calcObj
        && subDocsExist(prop, key)
      ) {
        calcObj = {};
        set(prop, key, calcObj);
      }
      // Sub document didn't exist, skip this field
      if (!calcObj) return;
      // Keep a list of empty calculations for potential deletion if they aren't used
      if (!calcObj.calculation) {
        prop._computationDetails.emptyCalculations.push(calcObj);
      }
      // Store a reference to all the calculations
      prop._computationDetails.calculations.push(calcObj);
      // Store the level to compute down to later
      calcObj._parseLevel = parseLevel;
      // Store the key
      calcObj._key = key;
      // Set a type
      calcObj.type = '_calculation';
      // Parse the calculation
      parseCalculation(calcObj);
    });
  });
}

function subDocsExist(prop, key) {
  const path = key.split('.');
  if (path.length < 2) return !!prop;
  path.pop();
  const subPath = path.join('.');
  return !!get(prop, subPath);
}

export function removeEmptyCalculations(prop) {
  prop._computationDetails.emptyCalculations.forEach(calcObj => {
    if (!calcObj.effects?.length) {
      unset(prop, calcObj._key);
    }
  });
}

function parseCalculation(calcObj) {
  const calcHash = cyrb53(calcObj.calculation || '0');
  // If the cached parse calculation is equal to the calculation, skip
  if (calcHash === calcObj.hash) {
    return;
  }
  calcObj.hash = calcHash;
  try {
    calcObj.parseNode = parse(calcObj.calculation || '0');
    calcObj.parseError = null;
  } catch (e) {
    let error = {
      type: 'evaluation',
      message: prettifyParseError(e),
    };
    calcObj.parseError = error;
    calcObj.parseNode = errorNode.create({ error: error.message });
  }
}
