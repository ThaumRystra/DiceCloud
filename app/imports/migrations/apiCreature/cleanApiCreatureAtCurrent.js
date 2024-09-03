import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';

export default function cleanApiCreatureAtCurrent(apiCreature) {
  apiCreature.creatureProperties = apiCreature.creatureProperties.map(prop => {
    let cleanProp = prop;
    try {
      const schema = CreatureProperties.simpleSchema(prop);
      // Clean according to schema
      cleanProp = schema.clean(prop);
      schema.validate(cleanProp);
    } catch (e) {
      console.warn('Failed to clean archive prop', { propId: prop._id, error: e.message || e.reason || e.toString() });
    }
    return cleanProp;
  });
}
