import applyFnToKey from '../utility/applyFnToKey.js';
import { unset } from 'lodash';

export default function removeSchemaFields(schemas, prop){
  schemas.forEach(schema => {
    schema._schemaKeys.forEach(key => {
      // Skip object and array keys, except the errors array
      if (
        schema.getQuickTypeForKey(key) === 'object' ||
        (
          schema.getQuickTypeForKey(key) === 'objectArray' &&
          key.slice(-6)!== 'errors'
        )
      ) return;
      // Unset other computed only keys
      applyFnToKey(prop, key, unset)
    });
  });
}
