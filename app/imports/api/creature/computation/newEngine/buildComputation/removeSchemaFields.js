import applyFnToKey from '../utility/applyFnToKey.js';
import { unset } from 'lodash';

export default function removeSchemaFields(schemas, prop){
  schemas.forEach(schema => {
    schema._schemaKeys.forEach(key => {
      // Skip object keys
      if (schema.getQuickTypeForKey(key) === 'object') return;
      // Unset other computed only keys
      applyFnToKey(prop, key, unset)
    });
  });
}
