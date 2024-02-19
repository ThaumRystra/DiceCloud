import { EngineAction } from '/imports/api/engine/action/EngineActions';

type InputProvider = {
  rollDice(
    action: EngineAction, dice: { number: number, diceSize: number }[]
  ): Promise<number[][]>;
  /**
   * Choose from a provided selection
   * @param action 
   * @param choices Options to choose from
   * @param quantity Number of choices to make [min, max] inclusive, where -1 means no limit
   */
  choose(
    action: EngineAction,
    choices: ({ _id: string } & Record<string, any>)[],
    quantity?: [min: number, max: number],
  ): Promise<string[]>;
}

export default InputProvider;