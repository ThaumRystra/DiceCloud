import { isEmpty } from 'lodash'
import EngineActions, { EngineAction, ActionSchema } from '/imports/api/engine/action/EngineActions';

export default async function writeChangedAction(original: EngineAction, changed: EngineAction) {
  const $set = {};
  for (const key of ActionSchema.objectKeys()) {
    if (!EJSON.equals(original[key], changed[key])) {
      $set[key] = changed[key];
    }
  }
  if (!isEmpty($set) && original._id) {
    return EngineActions.updateAsync(original._id, { $set });
  }
}
