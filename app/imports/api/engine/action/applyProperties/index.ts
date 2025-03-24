import { EngineAction } from '/imports/api/engine/action/EngineActions';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import { PropTask } from '/imports/api/engine/action/tasks/Task';
import TaskResult from '/imports/api/engine/action/tasks/TaskResult';

import action from './applyActionProperty';
import adjustment from './applyAdjustmentProperty';
import branch from './applyBranchProperty';
import buff from './applyBuffProperty';
import buffRemover from './applyBuffRemoverProperty';
import creature from './applyCreatureTemplateProperty';
import damage from './applyDamageProperty';
import folder from './applyFolderProperty';
import note from './applyNoteProperty';
import roll from './applyRollProperty';
import savingThrow from './applySavingThrowProperty';
import toggle from './applyToggleProperty';
import trigger from './applyTriggerProperty';

const applyPropertyByType: {
  [key: string]: (task: PropTask, action: EngineAction, result: TaskResult, input: InputProvider) => Promise<void>
} = {
  action,
  adjustment,
  branch,
  buff,
  buffRemover,
  creature,
  damage,
  folder,
  note,
  roll,
  savingThrow,
  spell: action,
  propertySlot: folder,
  toggle,
  trigger,
}

export default applyPropertyByType;
