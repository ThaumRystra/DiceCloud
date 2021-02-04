import computeToggle from '/imports/api/creature/computation/engine/computeToggle.js';
import { union } from 'lodash';

export default function applyToggles(prop, memo){
  prop.computationDetails.toggleAncestors.forEach(toggleId => {
    let toggle = memo.togglesById[toggleId];
    computeToggle(toggle, memo);
    prop.dependencies = union(
      prop.dependencies,
      [toggle._id],
      toggle.dependencies,
    );
    if (!toggle.toggleResult){
      prop.computationDetails.disabledByToggle = true;
    }
  });
}
