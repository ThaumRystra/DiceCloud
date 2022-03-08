import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { get, set } from 'lodash';
import applyFnToKey from '/imports/api/engine/computation/utility/applyFnToKey.js';
import  { calculationUp } from '/imports/migrations/server/dbv1/dbv1.js';

export default function cleanAt1(archive){
  archive.properties = archive.properties.map(prop => {
    let cleanProp = prop;
    try {
      if (prop.type === 'attack') prop.type = 'action';
      // Get the schema
      const schema = CreatureProperties.simpleSchema(prop);
      // Clean all the text fields with inline calcs
      schema.inlineCalculationFields().forEach(key => {
        applyFnToKey(prop, key, (prop, key) => {
          let field = get(prop, key);
          if (typeof field === 'string' || typeof field === 'number'){
            field = calculationUp(field);
            set(prop, key, {text: `${field}`});
          }
        });
      });
      schema.computedFields().forEach(key => {
        applyFnToKey(prop, key, (prop, key) => {
          let field = get(prop, key) || get(prop, key + 'Calculation');
          if (typeof field === 'string' || typeof field === 'number'){
            field = calculationUp(field);
            set(prop, key, {calculation: `${field}`});
          }
        });
      });
      cleanProp = schema.clean(prop);
      schema.validate(cleanProp);
    } catch (e){
      console.warn({propId: prop._id, error: e.message || e.reason || e.toString()});
    }
    return cleanProp;
  });
}
