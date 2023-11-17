import SimpleSchema from 'simpl-schema';
import { forEach, isEmpty, pick } from 'lodash';
import LogContentSchema from '/imports/api/creature/log/LogContentSchema';
import { getPropertyChildren, getSingleProperty, getVariables } from '/imports/api/engine/loadCreatures';
import recalculateInlineCalculations from '/imports/api/engine/actions/applyPropertyByType/shared/recalculateInlineCalculations';
import recalculateCalculation from '/imports/api/engine/actions/applyPropertyByType/shared/recalculateCalculation';
import rollDice from '/imports/parser/rollDice';

const Actions = new Mongo.Collection<ActionWithId>('actions');

interface Action {
  creatureId: string;
  rootPropId: string;
  targetIds?: string[];
  userInputNeeded?: any;
  stepThrough?: boolean;
  taskQueue: Task[];
  taskProperties: any;
  deferredResults: { [id: string]: PartialTaskResult };
  results: TaskResult[];
}

interface ActionWithId extends Action {
  _id: string;
}

type Task = {
  propId: string;
  targetIds: string[];
}

type TaskResult = {
  propId: string;
  targetIds: string[];
  scope: any;
  mutations: Mutation[];
  step?: number;
  deferred?: boolean;
  deferredState?: any;
}

class PartialTaskResult {
  scope: any;
  mutations: Mutation[];
  step?: number;
  deferred?: boolean;
  deferredState?: any;
  constructor() {
    this.scope = {};
    this.mutations = [];
  }
  // Appends the log content to the latest mutation
  appendLog(content: LogContent, targetIds: string[]) {
    if (!this.mutations.length) {
      this.mutations.push({ targetIds, contents: [] });
    }
    const latestMutation = this.mutations[this.mutations.length - 1]
    if (!latestMutation.contents) {
      latestMutation.contents = [];
    }
    latestMutation.contents.push(content);
  }
}

type Mutation = {
  // Which creatures the mutation is applied to
  targetIds: string[];
  // What changes in the database
  updates?: {
    propId: string;
    set?: any;
    inc?: any;
    type: string,
  }[];
  // Logged when this is applied
  contents?: LogContent[];
}

type LogContent = {
  name?: string;
  value?: string;
  inline?: boolean;
  context?: any;
  silenced?: boolean;
}

const ActionSchema = new SimpleSchema({
  creatureId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  rootPropId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  targetIds: {
    type: Array,
    defaultValue: [],
  },
  'targetIds.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  userInputNeeded: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  stepThrough: {
    type: Boolean,
    defaultValue: false,
  },

  // A stack of tasks to apply
  // Each task has a propId to apply and a targetId list
  taskQueue: {
    type: Array,
  },
  'taskQueue.$': {
    type: Object,
  },
  'taskQueue.$.propId': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  'taskQueue.$.targetIds': {
    type: Array,
    defaultValue: [],
  },
  'taskQueue.$.targetIds.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },

  // Pseudo properties that don't exist on the character, but can be applied by the action
  // {_id: prop}
  'taskProperties': {
    type: Object,
    blackbox: true,
    defaultValue: {},
  },
  // Results that have been partially computed, but require more steps
  // {_id: partialResult}
  'deferredResults': {
    type: Object,
    blackbox: true,
    defaultValue: {},
  },

  // Applied properties
  results: {
    type: Array,
    defaultValue: [],
  },
  'results.$': {
    type: Object,
  },
  // The property and target ids popped off the task stack
  // Pushing these to the top of the stack and deleting the results from this point onwards
  // Should re-run the action identically from this point
  'results.$.propId': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  'results.$.targetIds': {
    type: Array,
    defaultValue: [],
  },
  'results.$.targetIds.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  // Changes in local scope made by this result
  'results.$.scope': {
    type: Object,
    optional: true,
    blackbox: true,
  },
  // database changes
  'results.$.mutations': {
    type: Array,
    optional: true,
  },
  'results.$.mutations.$': {
    type: Object,
  },
  'results.$.mutations.$.targetIds': {
    type: Array,
  },
  'results.$.mutations.$.targetIds.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  'results.$.mutations.$.updates': {
    type: Array,
    optional: true,
  },
  'results.$.mutations.$.updates.$': {
    type: Object,
  },
  'results.$.mutations.$.updates.$.propId': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  'results.$.mutations.$.updates.$.set': {
    type: Object,
    optional: true,
    blackbox: true,
  },
  'results.$.mutations.$.contents': {
    type: Array,
    optional: true,
  },
  'results.$.mutations.$.contents.$': {
    type: LogContentSchema,
  },
});

// @ts-expect-error Collections2 lacks TypeScript support
Actions.attachSchema(ActionSchema);

export default Actions;

/**
 * Create a new action ready to be run starting at the given property (or its 'before' triggers)
 * @param prop 
 */
export function createAction(prop) {
  const action: Action = {
    creatureId: prop.ancestors[0].id,
    rootPropId: prop._id,
    taskQueue: [],
    taskProperties: {},
    deferredResults: {},
    results: [],
  };
  pushPropAndTriggers(action, prop);
  return Actions.insertAsync(action);
}

// Run an already created action
export async function runAction(actionId: string, userInput?) {
  const action = await Actions.findOneAsync(actionId);
  if (!action) throw new Meteor.Error('Not found', 'The action does not exist');
  const originalAction = EJSON.clone(action);
  let count = 0;
  do {
    // If there isn't a next task, stop
    if (!action.taskQueue.length) break;
    await applyNextTask(action, userInput);
    count += 1;
    if (count > 100) {
      break;
    }
  } while (!action.userInputNeeded && !action.stepThrough)

  // Persist changes to the action
  const writePromise = writeChangedAction(originalAction, action);
  if (count > 100) {
    throw new Meteor.Error('Too many properties', 'Only 100 properties may fire at a time');
  }
  return writePromise;
}

async function applyNextTask(action, userInput?) {
  // Get the next task
  const task = action.taskQueue[0];
  // Get the property from the action's task properties or the creature's properties
  let prop;
  const taskProp = action.taskProperties[task.propId];
  if (taskProp) {
    prop = taskProp;
  } else {
    prop = await getSingleProperty(action.creatureId, task.propId);
  }
  // Ensure the prop exists
  if (!prop) throw new Meteor.Error('Not found', 'Property could not be found');
  if (prop.deactivatedByToggle) return;

  // Apply the property
  const result: TaskResult | undefined = await applyPropertyByType[prop.type]?.(prop, task, action, userInput);

  if (result) {
    // store the task's details and save the result
    result.scope[`#${prop.type}`] = prop;
    result.propId = task.propId;
    result.targetIds = task.targetIds;
    if (result.deferred) {
      delete result.deferred;
      result.step = (result.step || 0) + 1;
      action.deferredResults[task.propId] = result;
    } else {
      // There was a result and it wasn't deferred, we can remove this task from the queue
      action.taskQueue.shift();
      action.results.push(result);
    }
  } else if (!action.userInputNeeded) {
    // Prevent accidental infinite loops if we don't remove the task, but also don't break for input
    throw 'The only time result can be undefined is if we are waiting for user input';
  }
}

function writeChangedAction(original: ActionWithId, changed: ActionWithId) {
  const $set = {};
  for (const key of ActionSchema.objectKeys()) {
    if (!EJSON.equals(original[key], changed[key])) {
      $set[key] = changed[key];
    }
  }
  if (!isEmpty($set)) {
    return Actions.updateAsync(original._id, { $set });
  }
}

/**
 * Push a prop and its before/after triggers to the task stack
 * Triggers will share the same targetIds as the prop task
 * @param action The action to add the task to
 * @param prop The property to make a task of
 * @param targetIds The targetIds the prop and triggers will apply to
 */
function pushPropAndTriggers(action: Action, prop, targetIds?) {
  // Push the before triggers to the queue
  forEach(prop.triggerIds?.before, triggerId => {
    action.taskQueue.push({ propId: triggerId, targetIds });
  });

  // Push the prop task to the queue
  action.taskQueue.push({ propId: prop._id, targetIds });

  // Push the after triggers to the queue
  forEach(prop.triggerIds?.after, triggerId => {
    action.taskQueue.push({ propId: triggerId, targetIds });
  });
}

/**
 * Push all the children of a prop and all trigger of those children to the task queue
 * @param action The action to add the task to
 * @param prop The property to make a task of
 * @param targetIds The targetIds the prop and triggers will apply to
 */
async function pushChildren(action: Action, prop, targetIds) {
  const children = await getPropertyChildren(action.creatureId, prop._id);
  // Push the child tasks and related triggers to the stack
  forEach(children, childProp => {
    pushPropAndTriggers(action, childProp, targetIds);
  });
}

function pushAfterChildrenTriggers(action: Action, prop, targetIds) {
  forEach(prop.triggerIds?.afterChildren, triggerId => {
    action.taskQueue.push({ propId: triggerId, targetIds });
  });
}

function createResult(): PartialTaskResult {
  // Add  the property to the action's local scope
  return new PartialTaskResult();
}

// Combine all the action results into the scope at present
export function getEffectiveActionScope(action) {
  const scope = getVariables(action.creatureId);
  for (const result of action.results) {
    Object.assign(scope, result.scope);
  }
  return scope;
}


type DamageProp = {
  _id?: string;
  operation: 'increment' | 'set';
  type: 'damageProp';
  value: number;
  targetPropId: string;
}

function pushDamagePropertyTasks(action, damageProp: DamageProp, targetProp, targetIds, result: PartialTaskResult) {
  // Save the values to the scope
  if (damageProp.operation === 'increment') {
    if (damageProp.value >= 0) {
      result.scope['~damage'] = { value: damageProp.value };
    } else {
      result.scope['~healing'] = { value: -damageProp.value };
    }
  } else {
    result.scope['~set'] = { value: damageProp.value };
  }
  // Push before triggers
  if (targetProp.triggers?.damageProperty?.before) {
    for (const triggerId of targetProp.triggers.damageProperty.before) {
      action.taskQueue.push({ propId: triggerId, targetIds });
    }
  }

  // Push damage pseudo prop
  if (!damageProp._id) damageProp._id = Random.id();
  action.taskProperties[damageProp._id] = damageProp;
  action.taskQueue.push({ propId: damageProp._id, targetIds });

  // Push after triggers
  if (targetProp.triggers?.damageProperty?.after) {
    for (const triggerId of targetProp.triggers.damageProperty.after) {
      action.taskQueue.push({ propId: triggerId, targetIds });
    }
  }
}

const applyPropertyByType = {
  async note(prop, task: Task, action: Action): Promise<PartialTaskResult> {
    const result = createResult();

    let contents: LogContent[] | undefined = undefined;
    const logContent = { name: prop.name, value: undefined };
    if (prop.summary?.text) {
      recalculateInlineCalculations(prop.summary, action);
      logContent.value = prop.summary.value;
    }

    if (logContent.name || logContent.value) {
      contents = [logContent];
    }
    // Log description
    if (prop.description?.text) {
      recalculateInlineCalculations(prop.description, action);
      if (!contents) contents = [];
      contents.push({ value: prop.description.value });
    }
    if (contents) {
      result.mutations.push({
        contents,
        targetIds: task.targetIds,
      });
    }

    await pushChildren(action, prop, task.targetIds);
    await pushAfterChildrenTriggers(action, prop, task.targetIds);

    return result;
  },

  async branch(prop, task: Task, action: Action, userInput): Promise<PartialTaskResult> {
    // const scope = getEffectiveActionScope(action);
    const result = createResult();
    const targets = task.targetIds;

    switch (prop.branchType) {
      case 'if': {
        recalculateCalculation(prop.condition, action, 'reduce');
        if (prop.condition?.value) {
          await pushChildren(action, prop, targets);
        }
        pushAfterChildrenTriggers(action, prop, targets);
        break;
      }
      case 'index': {
        const children = await getPropertyChildren(action.creatureId, prop._id);
        if (children.length) {
          recalculateCalculation(prop.condition, action, 'reduce');
          if (!isFinite(prop.condition?.value)) {
            result.appendLog({
              name: 'Branch Error',
              value: 'Index did not resolve into a valid number'
            }, targets);
            break;
          }
          let index = Math.floor(prop.condition?.value);
          if (index < 1) index = 1;
          if (index > children.length) index = children.length;
          pushPropAndTriggers(action, children[index - 1], targets);
        }
        pushAfterChildrenTriggers(action, prop, targets);
        break;
      }
      case 'hit': {
        const scope = getEffectiveActionScope(action);
        if (scope['~attackHit']?.value) {
          if (!targets.length && !prop.silent) {
            result.appendLog({
              value: '**On hit**'
            }, targets);
          }
          await pushChildren(action, prop, targets);
        }
        pushAfterChildrenTriggers(action, prop, targets);
        break;
      }
      case 'miss': {
        const scope = getEffectiveActionScope(action);
        if (scope['~attackMiss']?.value) {
          if (!targets.length && !prop.silent) {
            result.appendLog({
              value: '**On miss**'
            }, targets);
          }
          await pushChildren(action, prop, targets);
        }
        pushAfterChildrenTriggers(action, prop, targets);
        break;
      }
      case 'failedSave': {
        const scope = getEffectiveActionScope(action);
        if (scope['~saveFailed']?.value) {
          if (!targets.length && !prop.silent) {
            result.appendLog({
              value: '**On failed save**'
            }, targets);
          }
          await pushChildren(action, prop, targets);
        }
        pushAfterChildrenTriggers(action, prop, targets);
        break;
      }
      case 'successfulSave': {
        const scope = getEffectiveActionScope(action);
        if (scope['~saveSucceeded']?.value) {
          if (!targets.length && !prop.silent) {
            result.appendLog({
              value: '**On save**'
            }, targets);
          }
          await pushChildren(action, prop, targets);
        }
        pushAfterChildrenTriggers(action, prop, targets);
        break;
      }
      case 'random': {
        const children = await getPropertyChildren(action.creatureId, prop._id);
        if (children.length) {
          const index = rollDice(1, children.length)[0] - 1;
          pushPropAndTriggers(action, children[index], targets);
        }
        pushAfterChildrenTriggers(action, prop, targets);
        break;
      }
      case 'eachTarget':
        if (targets.length) {
          for (const targetId in targets) {
            await pushChildren(action, prop, [targetId]);
            pushAfterChildrenTriggers(action, prop, [targetId]);
          }
        } else {
          await pushChildren(action, prop, targets);
          pushAfterChildrenTriggers(action, prop, targets);
        }
        break;
      case 'choice': {
        // If there is no input to consume, return no result, but mark the action as requiring input
        if (!userInput) {
          action.userInputNeeded = pick(prop, ['_id', 'type', 'branchType']);
          return;
        }
        const children = await getPropertyChildren(action.creatureId, prop._id);
        let index = userInput.choice;
        if (!isFinite(index) || index < 0) index = 0;
        if (index > children.length - 1) index = children.length - 1;
        pushPropAndTriggers(action, children[index], targets);
        pushAfterChildrenTriggers(action, prop, targets);
        break;
      }
    }

    return result;
  },

  async adjustment(prop, task: Task, action: Action): Promise<PartialTaskResult> {

    let result = action.deferredResults[task.propId];
    if (!result) result = createResult();

    const queueChildren = async function (targetIds) {
      await pushChildren(action, prop, targetIds);
      await pushAfterChildrenTriggers(action, prop, targetIds);
    }

    const damageTargets = prop.target === 'self' ? [action.creatureId] : task.targetIds;

    // Step 0, get the operation and value and push the damage pseudo prop to the queue
    if (!result.step) {

      if (!prop.amount) {
        queueChildren(task.targetIds);
        return result;
      }

      // Evaluate the amount
      recalculateCalculation(prop.amount, action, 'reduce');

      const value = +prop.amount.value;
      if (!isFinite(value)) {
        queueChildren(task.targetIds);
        return result;
      }

      if (damageTargets?.length) {
        for (const targetId of damageTargets) {
          queueChildren([targetId]);
          const statId = getVariables(targetId)?.[prop.stat]?._propId;
          if (!statId) continue;

          const stat = getSingleProperty(targetId, statId);
          if (!stat) continue;

          if (!stat?.type) {
            if (!prop.silent) result.appendLog({
              name: 'Error',
              value: `Could not apply attribute damage, creature does not have \`${prop.stat}\` set`
            }, [targetId]);
            continue;
          }
          pushDamagePropertyTasks(action, {
            type: 'damageProp',
            value,
            operation: prop.operation,
            targetPropId: stat._id,
          }, stat, [targetId], result);
        }
      }
      result.deferred = true;
      result.deferredState = { value };
    }
    // Step 1, Log the results
    else if (result.step === 1) {
      const value = result.deferredState.value;
      if (damageTargets?.length) {
        for (const targetId of damageTargets) {
          result.appendLog({
            name: 'Attribute damage',
            value: `${prop.stat}${prop.operation === 'set' ? ' set to' : ''}` +
              ` ${value}`,
            inline: true,
            silenced: prop.silent,
          }, [targetId]);
        }
      } else {
        result.appendLog({
          name: 'Attribute damage',
          value: `${prop.stat}${prop.operation === 'set' ? ' set to' : ''}` +
            ` ${value}`,
          inline: true,
          silenced: prop.silent,
        }, task.targetIds);
      }
    }
    return result;
  },

  async damageProp(prop: DamageProp, task: Task, action: Action): Promise<PartialTaskResult> {
    // fetch the value from the scope after the before triggers, in case they changed them
    const result = createResult();
    const scope = getEffectiveActionScope(action);
    const operation = prop.operation;
    let value;
    if (prop.operation === 'increment') {
      if (prop.value >= 0) {
        value = scope['~damage']?.value;
      } else {
        value = -scope['~healing']?.value;
      }
    } else {
      value = scope['~set']?.value;
    }

    let damage, newValue, increment;
    if (task.targetIds.length) {
      for (const targetId of task.targetIds) {
        const targetProp = getSingleProperty(targetId, prop.targetPropId);
        if (!targetProp) continue;
        if (operation === 'set') {
          const total = targetProp.total || 0;
          // Set represents what we want the value to be after damage
          // So we need the actual damage to get to that value
          damage = total - value;
          // Damage can't exceed total value
          if (damage > total && !targetProp.ignoreLowerLimit) damage = total;
          // Damage must be positive
          if (damage < 0 && !targetProp.ignoreUpperLimit) damage = 0;
          newValue = targetProp.total - damage;
          // Write the results
          result.mutations.push({
            targetIds: [targetId],
            updates: [{
              propId: targetProp._id,
              set: { damage, value: newValue },
              type: targetProp.type,
            }],
          });
        } else if (operation === 'increment') {
          const currentValue = targetProp.value || 0;
          const currentDamage = targetProp.damage || 0;
          increment = value;
          // Can't increase damage above the remaining value
          if (increment > currentValue && !targetProp.ignoreLowerLimit) increment = currentValue;
          // Can't decrease damage below zero
          if (-increment > currentDamage && !targetProp.ignoreUpperLimit) increment = -currentDamage;
          damage = currentDamage + increment;
          newValue = targetProp.total - damage;
          // Write the results
          result.mutations.push({
            targetIds: [targetId],
            updates: [{
              propId: targetProp._id,
              inc: { damage: increment, value: -increment },
              type: targetProp.type,
            }],
          });
        }
      }
    }
    return result;
  }
}
