import computeToggle from '/imports/api/creature/computation/engine/computeToggle.js';
import { union } from 'lodash';

export default function applyToggles(prop, memo){
  // If it used to be inactive delete those fields
  if (prop.inactive) prop.inactive = undefined;
  if (prop.deactivatedByAncestor) prop.deactivatedByAncestor = undefined;
  if (prop.deactivatedByToggle) prop.deactivatedByToggle = undefined;
  // Iterate through the toggle ancestors from oldest to nearest
  prop.computationDetails.toggleAncestors.forEach(toggleId => {
    let toggle = memo.togglesById[toggleId];
    computeToggle(toggle, memo);
    prop.dependencies = union(
      prop.dependencies,
      [toggle._id],
      toggle.dependencies,
    );
    // Deactivate if the toggle is false
    if (!toggle.toggleResult){
      prop.inactive = true;
      prop.deactivatedByAncestor = true;
      prop.deactivatedByToggle = true;
    }
  });
}
