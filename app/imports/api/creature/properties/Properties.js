import SimpleSchema from 'simpl-schema';
import SoftRemovableSchema from '/imports/api/creature/parenting/SoftRemovableSchema.js';
import ChildSchema from '/imports/api/creature/parenting/ChildSchema.js';
import softRemove from '/imports/api/creature/parenting/softRemove.js';
import getCollectionByName from '/imports/api/creature/parenting/getCollectionByName.js';

// Mixins
import recomputeCreatureMixin from '/imports/api/creature/mixins/recomputeCreatureMixin.js';
import creaturePermissionMixin from '/imports/api/creature/mixins/creaturePermissionMixin.js';
import simpleSchemaMixin from '/imports/api/creature/mixins/simpleSchemaMixin.js';

const PropertySchema = new SimpleSchema({
  charId: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		index: 1,
    optional: true,
	},
  name: {
    type: String,
    optional: true,
  },
  enabled: {
    type: Boolean,
    defaultValue: true,
  },
  order: {
  	type: SimpleSchema.Integer,
  	index: true,
  },
});

PropertySchema.extend(SoftRemovableSchema);
PropertySchema.extend(ChildSchema);

// Always recomputes the character, because we don't know the extent of the tree
// that was removed with this document
const softRemoveProperty = new ValidatedMethod({
  name: 'softRemoveProperty',
  mixins: [
    simpleSchemaMixin,
    recomputeCreatureMixin,
    creaturePermissionMixin,
  ],
  getCharId({_id, collection}){
    let col = getCollectionByName(collection);
    let doc = col.findOne(_id, {fields: {charId: 1}});
    if (!doc || !doc.charId){
      throw new Meteor.Error(`Could not find charId of ${_id} in ${collection}`);
    } else {
      return doc.charId;
    }
  },
  permission: 'edit',
  schema: new SimpleSchema({
    _id: SimpleSchema.RegEx.Id,
    collection: String,
  }),
  run({_id, collection}){
    softRemove({_id, collection});
  },
});

export { PropertySchema, softRemoveProperty };
