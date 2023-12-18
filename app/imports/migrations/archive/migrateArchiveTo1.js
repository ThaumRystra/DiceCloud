import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { get, set } from 'lodash';
import applyFnToKey from '/imports/api/engine/computation/utility/applyFnToKey';


function calculationUp(val) {
  if (typeof val !== 'string') return val;
  if (!val.replace) console.log({ val, replace: val.replace });
  return val.replace(/#(\w+).(\w+)Result/g, '#$1.$2')
    .replace(/\.value/g, '.total')
    .replace(/\.currentValue/g, '.value');
}

export default function migrateTo1(archive) {
  archive.properties = archive.properties.map(prop => {
    try {
      if (prop.type === 'attack') prop.type = 'action';
      if (prop.type === 'slotFiller') prop.type = 'folder';
      // Get the schema
      const schema = CreatureProperties.simpleSchema(prop);
      // Clean all the text fields with inline calcs
      schema.inlineCalculationFields().forEach(key => {
        applyFnToKey(prop, key, (prop, key) => {
          let field = get(prop, key);
          if (typeof field === 'string' || typeof field === 'number') {
            field = calculationUp(field);
            set(prop, key, { text: `${field}` });
          }
        });
      });
      schema.computedFields().forEach(key => {
        applyFnToKey(prop, key, (prop, key) => {
          let field = get(prop, key) || get(prop, key + 'Calculation');
          if (typeof field === 'string' || typeof field === 'number') {
            field = calculationUp(field);
            set(prop, key, { calculation: `${field}` });
          }
        });
      });
    } catch (e) {
      console.warn('Property migration -> 1 failed: ', { propId: prop._id, error: e.message || e.reason || e.toString() });
    }
    return prop;
  });
}
