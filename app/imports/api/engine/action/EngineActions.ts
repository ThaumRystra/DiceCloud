import SimpleSchema from 'simpl-schema';
import TaskResult from './tasks/TaskResult';
import LogContentSchema from '/imports/api/creature/log/LogContentSchema';
import Task from './tasks/Task';

const EngineActions = new Mongo.Collection<EngineAction>('actions');

export interface EngineAction {
  _id?: string;
  _isSimulation?: boolean;
  _stepThrough?: boolean;
  _decisions?: any[],
  task: Task;
  creatureId: string;
  tabletopId?: string;
  results: TaskResult[];
  taskCount: number;
}

const ActionSchema = new SimpleSchema({
  creatureId: {
    type: String,
    max: 32,
    // @ts-expect-error index not defined
    index: 1,
  },
  rootPropId: {
    type: String,
    max: 32,
    optional: true,
  },
  tabletopId: {
    type: String,
    max: 32,
    optional: true,
    // @ts-expect-error index not defined
    index: 1,
  },
  task: {
    type: Object,
    blackbox: true,
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
    max: 32,
  },
  'results.$.targetIds': {
    type: Array,
    defaultValue: [],
  },
  'results.$.targetIds.$': {
    type: String,
    max: 32,
  },
  // Changes that override the local scope
  'results.$.scope': {
    type: Object,
    optional: true,
    blackbox: true,
  },
  // Changes that consume pushed values from the local scope
  'results.$.popScope': {
    type: Object,
    optional: true,
    blackbox: true,
  },
  // Changes that push values to the local scope
  'results.$.pushScope': {
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
    max: 32,
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
    max: 32,
  },
  // Required, because CreatureProperties.update requires a selector of { type }
  'results.$.mutations.$.updates.$.type': {
    type: String,
  },
  'results.$.mutations.$.updates.$.set': {
    type: Object,
    optional: true,
    blackbox: true,
  },
  'results.$.mutations.$.updates.$.inc': {
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

EngineActions.attachSchema(ActionSchema);

export default EngineActions;
export { ActionSchema }
