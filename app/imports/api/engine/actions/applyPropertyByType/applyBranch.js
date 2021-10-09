import applyProperty from '../applyProperty.js';
import recalculateCalculation from './shared/recalculateCalculation.js';

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
