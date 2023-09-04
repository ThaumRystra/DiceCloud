import {
  setLineageOfDocs,
  renewDocIds
} from '/imports/api/parenting/parenting.js';
import { setDocToLastOrder } from '/imports/api/parenting/order.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import computedSchemas from '/imports/api/properties/computedPropertySchemasIndex.js';
import applyFnToKey from '/imports/api/engine/computation/utility/applyFnToKey.js';
import { get } from 'lodash';
import resolve, { map, toString } from '/imports/parser/resolve.js';
import symbol from '/imports/parser/parseTree/symbol.js';
import logErrors from './shared/logErrors.js';
import { insertCreatureLog } from '/imports/api/creature/log/CreatureLogs.js';
import cyrb53 from '/imports/api/engine/computation/utility/cyrb53.js';
import { applyNodeTriggers } from '/imports/api/engine/actions/applyTriggers.js';
import INLINE_CALCULATION_REGEX from '/imports/constants/INLINE_CALCULTION_REGEX.js';
import recalculateInlineCalculations from './shared/recalculateInlineCalculations.js';

export default function applyBuff(node, actionContext) {
  applyNodeTriggers(node, 'before', actionContext);
  const prop = node.node;
  let buffTargets = prop.target === 'self' ? [actionContext.creature] : actionContext.targets;

  // Mark the buff as dirty for recalculation
  prop.dirty = true;

  // Then copy the descendants of the buff to the targets
  let propList = [prop];
  function addChildrenToPropList(children, { skipCrystalize } = {}) {
    children.forEach(child => {
      if (skipCrystalize) child.node._skipCrystalize = true;
      propList.push(child.node);
      // recursively add the child's children, but don't crystalize nested buffs
      addChildrenToPropList(child.children, {
        skipCrystalize: skipCrystalize || child.node.type === 'buff'
      });
    });
  }
  addChildrenToPropList(node.children);
  if (!prop.skipCrystalization) {
    crystalizeVariables({ propList, actionContext });
  }

  let oldParent = {
    id: prop.parent.id,
    collection: prop.parent.collection,
  };
  buffTargets.forEach(target => {
    // Apply the buff
    copyNodeListToTarget(propList, target, oldParent);

    //Log the buff
    let logValue = prop.description?.value
    if (prop.description?.text) {
      recalculateInlineCalculations(prop.description, actionContext);
      logValue = prop.description?.value;
    }
    if ((prop.name || prop.description?.value) && !prop.silent) {
      if (target._id === actionContext.creature._id) {
        // Targeting self
        actionContext.addLog({
          name: prop.name,
          value: logValue,
        });
      } else {
        // Targeting other
        insertCreatureLog.call({
          log: {
            creatureId: target._id,
            content: [{
              name: prop.name,
              value: logValue,
            }],
          }
        });
      }
    }
  });
  applyNodeTriggers(node, 'after', actionContext);
  applyNodeTriggers(node, 'afterChildren', actionContext);

  // Don't apply the children of the buff, they get copied to the target instead
}

function copyNodeListToTarget(propList, target, oldParent) {
  let ancestry = [{ collection: 'creatures', id: target._id }];
  setLineageOfDocs({
    docArray: propList,
    newAncestry: ancestry,
    oldParent,
  });
  renewDocIds({
    docArray: propList,
  });
  setDocToLastOrder({
    collection: CreatureProperties,
    doc: propList[0],
  });
  CreatureProperties.batchInsert(propList);
}

/**
 * Replaces all variables with their resolved values
 * except variables of the form `~target.thing.total` become `thing.total`
 */
function crystalizeVariables({ propList, actionContext }) {
  propList.forEach(prop => {
    if (prop._skipCrystalize) {
      delete prop._skipCrystalize;
      return;
    }
    // Iterate through all the calculations and crystalize them
    computedSchemas[prop.type].computedFields().forEach(calcKey => {
      applyFnToKey(prop, calcKey, (prop, key) => {
        const calcObj = get(prop, key);
        if (!calcObj?.parseNode) return;
        calcObj.parseNode = map(calcObj.parseNode, node => {
          // Skip nodes that aren't symbols or accessors
          if (
            node.parseType !== 'accessor' && node.parseType !== 'symbol'
          ) return node;
          // Handle variables
          if (node.name === '~target') {
            // strip ~target
            if (node.parseType === 'accessor') {
              node.name = node.path.shift();
              if (!node.path.length) {
                return symbol.create({ name: node.name })
              }
            } else {
              // Can't strip symbols
              actionContext.addLog({
                name: 'Error',
                value: 'Variable `~target` should not be used without a property: ~target.property',
              });
            }
            return node;
          } else {
            // Resolve all other variables
            const { result, context } = resolve('reduce', node, actionContext.scope);
            logErrors(context.errors, actionContext);
            return result;
          }
        });
        calcObj.calculation = toString(calcObj.parseNode);
        calcObj.hash = cyrb53(calcObj.calculation);
      });
    });
    // For each key in the schema
    computedSchemas[prop.type].inlineCalculationFields().forEach(calcKey => {
      // That ends in .inlineCalculations
      applyFnToKey(prop, calcKey, (prop, key) => {
        const inlineCalcObj = get(prop, key);
        if (!inlineCalcObj) return;

        // If there is no text, skip
        if (!inlineCalcObj.text) {
          return;
        }

        // Replace all the existing calculations
        let index = -1;
        inlineCalcObj.text = inlineCalcObj.text.replace(INLINE_CALCULATION_REGEX, () => {
          index += 1;
          return `{${inlineCalcObj.inlineCalculations[index].calculation}}`;
        });

        // Set the value to the uncomputed string
        inlineCalcObj.value = inlineCalcObj.text;

        // Write a new hash
        const inlineCalcHash = cyrb53(inlineCalcObj.text);
        if (inlineCalcHash === inlineCalcObj.hash) {
          // Skip if nothing changed
          return;
        }
        inlineCalcObj.hash = inlineCalcHash;
      });
    });
  });
}
