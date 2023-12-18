import applyFnToKey from '../utility/applyFnToKey';
import { unset } from 'lodash';

export default function removeSchemaFields(schemas, prop) {
  schemas.forEach(schema => {
    schema?.removeBeforeComputeFields?.().forEach(
      key => applyFnToKey(prop, key, unset)
    );
  });
}
