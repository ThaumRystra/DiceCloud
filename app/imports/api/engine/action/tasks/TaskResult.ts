import Context from '../../../../parser/types/Context';

/**
 * The result of running a task containing all the changes that need to be made to the listed
 * targets
 * Each mutation may apply to a different subset of targets
 */
export default class TaskResult {
  // The targets of the original task
  targetIds: string[];
  scope: any;
  // Consume pushed changes from the local scope, every change pushed must be popped later
  popScope?: any;
  // Push changes to the scope if the same task intends to consume them in later steps
  // These changes will be marked as _busy until they are consumed
  // This allows a property to run in between steps of the same property type without
  // bashing the variables used to maintain state between steps while still exposing
  // those variables to triggers that need to change them
  // If multiple properties use the same variable at once, the values used by outer
  // properties can be found on variable.previous
  pushScope?: any;
  mutations: Mutation[];
  constructor(targetIds: string[]) {
    this.targetIds = targetIds;
    this.mutations = [];
    this.scope = {};
  }
  // Appends the log content to the latest mutation
  appendLog(content: LogContent & { silenced: boolean | undefined }, targetIds: string[]) {
    // Create a shallow copy of the content
    const logContent: LogContent = { ...content };
    // remove false silenced properties
    if (!logContent.silenced) {
      delete logContent.silenced;
    }
    if (!this.mutations.length) {
      this.mutations.push({ targetIds, contents: [] });
    }
    const latestMutation = this.mutations[this.mutations.length - 1]
    if (!latestMutation.contents) {
      latestMutation.contents = [];
    }
    latestMutation.contents.push(logContent);
  }
  appendParserContextErrors(context: Context, targetIds: string[]) {
    if (!context.errors?.length) return;
    if (!this.mutations.length) {
      this.mutations.push({ targetIds, contents: [] });
    }
    const latestMutation = this.mutations[this.mutations.length - 1]
    if (!latestMutation.contents) {
      latestMutation.contents = [];
    }
    context.errors?.forEach(error => {
      latestMutation.contents?.push({
        name: 'Error',
        value: error.message,
      });
    });
  }
}

export type Mutation = {
  // Which creatures the mutation is applied to
  // A mutation may apply to all, or a subset of, the result's targets and the acting creature
  targetIds: string[];
  // What changes in the database
  updates?: Update[];
  // What properties get added
  // TODO make these properties a LibraryNode type
  inserts?: any[];
  // What properties get deleted
  removals?: Removal[];
  // Logged when this is applied
  contents?: LogContent[];
}

export type Update = {
  propId: string;
  type: string,
  set?: any;
  inc?: any;
}

export type Removal = {
  propId: string;
}

export type LogContent = {
  name?: string;
  value?: string;
  inline?: boolean;
  context?: any;
  silenced?: boolean;
}
