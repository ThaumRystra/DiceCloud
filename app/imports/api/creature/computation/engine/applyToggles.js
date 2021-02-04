import computeToggle from '/imports/api/creature/computation/engine/computeToggle.js';

export default function applyToggles(prop, memo){
  prop.computationDetails.toggleAncestors.forEach(toggleId => {
    let toggle = memo.togglesById[toggleId];
    computeToggle(toggle, memo);
    prop.dependencies.push(toggle._id, ...toggle.dependencies);
    if (!toggle.toggleResult){
      prop.computationDetails.disabledByToggle = true;
    }
  });
}
