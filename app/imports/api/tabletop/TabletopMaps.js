import SimpleSchema from 'simpl-schema';
import ChildSchema from '/imports/api/parenting/ChildSchema';

let TabletopMaps = new Mongo.Collection('tabletopmaps');

let TabletopMapschema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
  },
  texture: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  position: {
    type: Object,
    optional: true,
  },
  'position.x': {
    type: Number,
  },
  'position.y': {
    type: Number,
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  rotation: {
    type: Number,
    max: 360,
    min: 0,
  },
  // If this map was copied from a library map, this ID will be set
  libraryMapId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
});

const schema = new SimpleSchema({});
schema.extend(ChildSchema);
schema.extend(TabletopMapschema);
TabletopMaps.attachSchema(schema);

export default TabletopMaps;
