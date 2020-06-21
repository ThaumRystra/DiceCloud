import {
	setLineageOfDocs,
	renewDocIds
} from '/imports/api/parenting/parenting.js';
import {setDocToLastOrder} from '/imports/api/parenting/order.js';
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';

export default function applyBuff({
  prop,
  children,
  creature,
  targets = [],
  //actionContext,
}){
  let buffTargets = prop.target === 'self' ? [creature] : targets;

  //let scope = {
  //  ...creature.variables,
  //  ...actionContext,
  //};

  // TODO
  // If the target is not self, walk through all decendants and replace
  // variables in calculations with their values from the creature scope
  // If the target is self, replace all the target.x references with just x

  // Then copy the decendants of the buff to the targets
  prop.applied = true;
  let propList = [prop];
  function addChildrenToPropList(children){
    children.forEach(child => {
      propList.push(child.node);
      addChildrenToPropList(child.children);
    });
  }
  addChildrenToPropList(children);
  let oldParent = {
    id: prop.parent.id,
    collection: prop.parent.collection,
  };
  buffTargets.forEach(target => {
    copyNodeListToTarget(propList, target, oldParent);
  });
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
