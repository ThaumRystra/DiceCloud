import { EngineAction } from '/imports/api/engine/action/EngineActions';

type InputProvider = {
  rollDice(
    action: EngineAction, dice: { number: number, diceSize: number }[]
  ): Promise<number[][]>;
}

export default InputProvider;