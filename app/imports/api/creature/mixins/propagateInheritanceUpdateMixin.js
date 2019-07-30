import {
  updateChildren,
  updateDescendants,
} from '/imports/api/parenting/parenting.js';
import { inheritedFields } from '/imports/api/parenting/ChildSchema.js';
import MONGO_OPERATORS from '/imports/constants/MONGO_OPERATORS.js';

// This mixin can be safely applied to all update methods which are validated
// with the updateSchemaMixin. It will propagate updates to fields which
// are inherited and normalised on the parent or ancestor docs
// It should have neglible performance impact for updates that aren't inherited
function propagateInheritanceUpdate({_id, update}){
  let childModifier = {};
  let descendantModifier = {};
  // For each operator
  for (let operator of MONGO_OPERATORS){
    // If the operator is in the update, for each field
    if (update[operator]) for (let field in update[operator]){
      // Get the top level field that was actually modified
      const indexOfDot = field.indexOf('.');
      let modifiedField;
      if (indexOfDot !== -1) {
        modifiedField = field.substring(0, indexOfDot);
      } else {
        modifiedField = field;
      }
      // If that field is updated and inherited
      if (inheritedFields.has(modifiedField)){
        // Perform the same update on the descendants
        if (!childModifier[operator]) childModifier[operator] = {};
        if (!descendantModifier[operator]) descendantModifier[operator] = {};
        childModifier[operator][`parent.${field}`] = update[operator][field];
        descendantModifier[operator][`ancestors.$.${field}`] = update[operator][field];
      }
    }
  }

  // Update the parent object of its children
  updateChildren({
    parentId: _id,
    modifier: childModifier,
  });

  // Update the ancestors object of its descendants
  updateDescendants({
    ancestorId: _id,
    modifier: descendantModifier,
  });
}

export default function propagateInheritanceUpdateMixin(methodOptions){
  let runFunc = methodOptions.run;
  methodOptions.run = function({_id, update}){
    const result = runFunc.apply(this, arguments);
    propagateInheritanceUpdate({_id, update});
    return result;
  };
  return methodOptions;
}
