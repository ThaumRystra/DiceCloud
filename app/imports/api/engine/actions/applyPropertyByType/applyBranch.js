import applyProperty from '../applyProperty.js';
import recalculateCalculation from './shared/recalculateCalculation.js';
import rollDice from '/imports/parser/rollDice.js';

export default function applyBranch(node, {
  creature, targets, scope, log
}){
  const applyChildren = function(){
    node.children.forEach(child => applyProperty(child, {
      creature, targets, scope, log
    }));
  };
  const prop = node.node;
  switch(prop.branchType){
    case 'if':
      recalculateCalculation(prop.condition, scope, log);
      if (prop.condition?.value) applyChildren();
      break;
    case 'hit':
      if (scope['$attackHit']?.value) applyChildren();
      break;
    case 'miss':
      if (scope['$attackMiss']?.value) applyChildren();
      break;
    case 'failedSave':
      if (scope['$saveFailed']?.value) applyChildren();
      break;
    case 'successfulSave':
      if (scope['$saveSucceeded']?.value) applyChildren();
      break;
    case 'random':
      if (node.children.length){
        let index = rollDice(1, node.children.length)[0] - 1;
        applyProperty(node.children[index], {
          creature, targets, scope, log
        });
      }
      break;
    case 'eachTarget':
      if (targets.length){
        targets.forEach(target => {
          node.children.forEach(child => applyProperty(child, {
            creature, targets: [target], scope, log
          }));
        });
      } else {
        applyChildren();
      }
      break;
  }
}
