import applyProperty from '../applyProperty.js';
import recalculateCalculation from './shared/recalculateCalculation.js';
import rollDice from '/imports/parser/rollDice.js';

export default function applyBranch(node, actionContext){
  const applyChildren = function(){
    node.children.forEach(child => applyProperty(child, actionContext));
  };
  const scope = actionContext.scope;
  const targets = actionContext.targets;
  const prop = node.node;
  switch(prop.branchType){
    case 'if':
      recalculateCalculation(prop.condition, actionContext);
      if (prop.condition?.value) applyChildren();
      break;
    case 'index':
      if (node.children.length){
        recalculateCalculation(prop.condition, actionContext);
        if (!isFinite(prop.condition?.value)) {
          actionContext.addLog({
            name: 'Branch Error',
            value: 'Index did not resolve into a valid number'
          });
          break;
        }
        let index = Math.floor(prop.condition?.value);
        if (index < 1) index = 1;
        if (index > node.children.length) index = node.children.length;
        applyProperty(node.children[index - 1], actionContext);
      }
      break;
    case 'hit':
      if (scope['$attackHit']?.value){
        if (!targets.length) actionContext.addLog({value: '**On hit**'});
        applyChildren();
      }
      break;
    case 'miss':
      if (scope['$attackMiss']?.value){
        if (!targets.length) actionContext.addLog({value: '**On miss**'});
        applyChildren();
      }
      break;
    case 'failedSave':
      if (scope['$saveFailed']?.value){
        if (!targets.length) actionContext.addLog({value: '**On failed save**'});
        applyChildren();
      }
      break;
    case 'successfulSave':
      if (scope['$saveSucceeded']?.value){
        if (!targets.length) actionContext.addLog({value: '**On save**',});
        applyChildren();
      }
      break;
    case 'random':
      if (node.children.length){
        let index = rollDice(1, node.children.length)[0] - 1;
        applyProperty(node.children[index], actionContext);
      }
      break;
    case 'eachTarget':
      if (targets.length){
        targets.forEach(target => {
          actionContext.targets = [target]
          node.children.forEach(child => applyProperty(child, actionContext));
        });
      } else {
        applyChildren();
      }
      break;
  }
}
