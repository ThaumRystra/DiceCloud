import computeToggle from '/imports/api/creature/computation/computeToggle.js';

export default function applyToggles(prop, memo){
  prop.computationDetails.toggleAncestors.forEach(toggleId => {
    let toggle = memo.togglesById[toggleId];
    computeToggle(toggle, memo);
    if (!toggle.toggleResult){
      prop.computationDetails.disabledByToggle = true;
    }
  });
}
