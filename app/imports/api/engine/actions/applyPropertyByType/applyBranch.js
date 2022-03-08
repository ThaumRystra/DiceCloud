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
    case 'index':
      if (node.children.length){
        recalculateCalculation(prop.condition, scope, log);
        if (!isFinite(prop.condition?.value)) {
          log.content.push({
            name: 'Branch Error',
            value: 'Index did not resolve into a valid number'
          });
          break;
        }
        let index = Math.floor(prop.condition?.value);
        if (index < 1) index = 1;
        if (index > node.children.length) index = node.children.length;
        applyProperty(node.children[index - 1], {
          creature, targets, scope, log
        });
      }
      break;
    case 'hit':
      if (scope['$attackHit']?.value){
        if (!targets.length) log.content.push({value: '**On hit**'});
        applyChildren();
      }
      break;
    case 'miss':
      if (scope['$attackMiss']?.value){
        if (!targets.length) log.content.push({value: '**On miss**'});
        applyChildren();
      }
      break;
    case 'failedSave':
      if (scope['$saveFailed']?.value){
        if (!targets.length) log.content.push({value: '**On failed save**'});
        applyChildren();
      }
      break;
    case 'successfulSave':
      if (scope['$saveSucceeded']?.value){
        if (!targets.length) log.content.push({value: '**On save**',});
        applyChildren();
      }
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
