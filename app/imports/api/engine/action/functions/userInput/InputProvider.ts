import Task from '/imports/api/engine/action/tasks/Task';

type InputProvider = {
  /**
   * Get the ids of the creatures being targeted
   */
  targetIds(target: 'singleTarget' | 'multipleTargets', currentTargetIds?: string[]): Promise<string[]>;
  /**
   * Show the user the next property or task to apply and wait for input to continue
   */
  nextStep?(task: Task): Promise<void>;
  /**
   * Roll dice
   * @param dice How many dice
   * @param diceSize How many faces per die
   */
  rollDice(
    dice: { number: number, diceSize: number }[]
  ): Promise<number[][]>;
  /**
   * Choose from a provided selection
   * @param action 
   * @param choices Options to choose from
   * @param quantity Number of choices to make [min, max] inclusive, where -1 means no limit
   */
  choose(
    choices: ({ _id: string } & Record<string, any>)[],
    quantity?: [min: number, max: number],
  ): Promise<string[]>;
  /**
   * Get advantage, natural, or disadvantage for a d20 roll
   */
  advantage(suggestedAdvantage: Advantage): Promise<Advantage>;
  /**
   * Get the details of a check or save
   */
  check(suggestedParams: CheckParams): Promise<CheckParams>;
}

export type Advantage = 0 | 1 | -1;

export type CheckParams = {
  advantage: Advantage;
  skillVariableName?: string;
  abilityVariableName?: string;
  dc: number | null;
  contest?: true;
  targetSkillVariableName?: string;
  targetAbilityVariableName?: string;
}

export default InputProvider;
