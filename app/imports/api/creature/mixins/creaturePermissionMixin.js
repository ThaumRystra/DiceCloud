import {
  assertEditPermission,
  assertViewPermission,
  assertOwnership,
} from '/imports/api/creature/creatures/creaturePermissions';

// Checks if the method has permission to run on the document. If the document
// has a charId, that creature is checked, otherwise if it has an _id and the
// collection is defined in the method options, that document is fetched to
// determine its charId, otherwise a getCharId method can be defined to perform
// a special search for the required creature
//
// Because this mixin injects the charId into argument objects that don't
// already contain it, it should always come last in the mixin list, so that it
// the outermost wrapper of the run function
export default function creaturePermissionMixin(methodOptions) {
  let assertPermission;
  if (methodOptions.permission === 'owner') {
    assertPermission = assertOwnership;
  } else if (methodOptions.permission === 'edit') {
    assertPermission = assertEditPermission;
  } else if (methodOptions.permission === 'view') {
    assertPermission = assertViewPermission;
  } else {
    throw "`permission` missing in method options";
  }

  let getCharId;
  if (methodOptions.getCharId) {
    getCharId = methodOptions.getCharId;
  } else if (methodOptions.collection) {
    getCharId = function ({ _id }) {
      return methodOptions.collection.findOne(_id, {
        fields: { charId: 1 }
      }).charId;
    };
  } else {
    getCharId = function () {
      throw "`getCharId` or `collection` missing in method options," +
      " or {charId} missing in call";
    };
  }

  let runFunc = methodOptions.run;
  methodOptions.run = function (doc, ...rest) {
    // Store the charId on the doc for other mixins if it had to be fetched
    doc.charId = doc.charId || getCharId.apply(this, arguments);
    assertPermission(doc.charId, this.userId);
    return runFunc.call(this, doc, ...rest);
  };
  return methodOptions;
}
