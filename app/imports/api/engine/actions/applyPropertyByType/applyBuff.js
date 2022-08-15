import {
	setLineageOfDocs,
	renewDocIds
} from '/imports/api/parenting/parenting.js';
import {setDocToLastOrder} from '/imports/api/parenting/order.js';
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

export default function applyBuff(node, actionContext){
  applyNodeTriggers(node, 'before', actionContext);
  const prop = node.node;
  let buffTargets = prop.target === 'self' ? [actionContext.creature] : actionContext.targets;

  // Then copy the decendants of the buff to the targets
  let propList = [prop];
  function addChildrenToPropList(children){
    children.forEach(child => {
      propList.push(child.node);
      addChildrenToPropList(child.children);
    });
  }
  addChildrenToPropList(node.children);
  crystalizeVariables({propList, actionContext});

  let oldParent = {
    id: prop.parent.id,
    collection: prop.parent.collection,
  };
  buffTargets.forEach(target => {
    // Apply the buff
    copyNodeListToTarget(propList, target, oldParent);

    //Log the buff
    if (prop.name || prop.description?.value){
      if (target._id === actionContext.creature._id){
        // Targeting self
        actionContext.addLog({
          name: prop.name,
          value: prop.description?.value,
        });
      } else {
        // Targeting other
        insertCreatureLog.call({
          log: {
            creatureId: target._id,
            content: [{
              name: prop.name,
              value: prop.description?.value,
            }],
          }
        });
      }
    }
  });
  applyNodeTriggers(node, 'after', actionContext);

  // Don't apply the children of the buff, they get copied to the target instead
}

function copyNodeListToTarget(propList, target, oldParent){
  let ancestry = [{collection: 'creatures', id: target._id}];
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
 * except variables of the form `$target.thing.total` become `thing.total`
 */
function crystalizeVariables({propList, actionContext}){
  propList.forEach(prop => {
    computedSchemas[prop.type].computedFields().forEach( calcKey => {
      applyFnToKey(prop, calcKey, (prop, key) => {
        const calcObj = get(prop, key);
        if (!calcObj?.parseNode) return;
        calcObj.parseNode = map(calcObj.parseNode, node => {
          // Skip nodes that aren't symbols or accessors
          if (
            node.parseType !== 'accessor' && node.parseType !== 'symbol'
          ) return node;
          // Handle variables
          if (node.name === '$target'){
            // strip $target
            if (node.parseType === 'accessor'){
              node.name = node.path.shift();
              if (!node.path.length){
                return symbol.create({name: node.name})
              }
            } else {
              // Can't strip symbols
              actionContext.addLog({
                name: 'Error',
                value: 'Variable `$target` should not be used without a property: $target.property',
              });
            }
            return node;
          } else {
            // Resolve all other variables
            const {result, context} = resolve('reduce', node, actionContext.scope);
            logErrors(context.errors, actionContext);
            return result;
          }
        });
        calcObj.calculation = toString(calcObj.parseNode);
        calcObj.hash = cyrb53(calcObj.calculation);
      });
    });
  });
}
