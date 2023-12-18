import SimpleSchema from 'simpl-schema';
import ChildSchema from '/imports/api/parenting/ChildSchema';

let TabletopObjects = new Mongo.Collection('tabletopObjects');

let TabletopObjectSchema = new SimpleSchema({
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
});

const schema = new SimpleSchema({});
schema.extend(ChildSchema);
schema.extend(TabletopObjectSchema);
TabletopObjects.attachSchema(schema);

export default TabletopObjects;
