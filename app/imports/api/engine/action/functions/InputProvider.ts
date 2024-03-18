type InputProvider = {
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
  advantage(suggestedAdvantage: 0 | 1 | -1): Promise<0 | 1 | -1>;
}

export default InputProvider;