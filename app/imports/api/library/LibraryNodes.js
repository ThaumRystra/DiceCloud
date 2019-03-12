import schema from '/imports/api/schema.js';
import SharingSchema from '/imports/api/sharing/SharingSchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';
import librarySchemas from '/imports/api/library/librarySchemas.js';

let LibraryNodes = new Mongo.Collection('libraryNodes');

let LibraryNodeSchema = schema({
	type: {
    type: String,
    allowedValues: Object.keys(librarySchemas),
  },
  data: {
    type: Object,
    custom(){
      let type = this.field('type');
      let schema = librarySchemas[type];
      schema.validate(this.value)
    },
  },
});

LibraryNodeSchema.extend(SharingSchema);

LibraryNodes.attachSchema(LibraryNodeSchema);
LibraryNodes.attachSchema(ChildSchema);

export default LibraryNodes;
export { LibraryNodeSchema };
