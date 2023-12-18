import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import applyFnToKey from '/imports/api/engine/computation/utility/applyFnToKey';
import { get } from 'lodash';

const dollarSignRegex = /(\W|^)\$(\w+)/gi;

export default function migrate1To2(archive) {
  archive.properties = archive.properties.map(prop => {
    try {
      // Migrate slot fillers to folders
      if (prop.type === 'slotFiller') {
        prop.type = 'folder';
        // If the slot filler has a description, change it to a computed one
        if (typeof prop.description == 'string') {
          prop.description = { text: prop.description };
        }
      }
      // Migrate slot filler slot type to folders
      if (prop.slotType === 'slotFiller') {
        prop.slotType = 'folder';
      }
      // Get the schema
      const schema = CreatureProperties.simpleSchema(prop);
      // Replace dollar signs in calculations with tildes
      schema.inlineCalculationFields().forEach(key => {
        applyFnToKey(prop, key, (prop, key) => {
          const inlineCalcObj = get(prop, key);
          const string = inlineCalcObj?.text;
          if (!string) return;
          const newString = string.replace(dollarSignRegex, '$1~$2');
          if (string !== newString) {
            inlineCalcObj.text = newString;
            inlineCalcObj.hash = null;
          }
        });
      });
      schema.computedFields().forEach(key => {
        applyFnToKey(prop, key, (prop, key) => {
          const inlineCalcObj = get(prop, key);
          const string = inlineCalcObj?.calculation;
          if (!string) return;
          const newString = string.replace(dollarSignRegex, '$1~$2');
          if (string !== newString) {
            inlineCalcObj.calculation = newString;
            inlineCalcObj.hash = null;
          }
        });
      });
    } catch (e) {
      console.warn('Property migration 1 -> 2 failed: ', { propId: prop._id, error: e.message || e.reason || e.toString() });
    }
    return prop;
  });
}
