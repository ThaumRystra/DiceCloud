import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import getDeterministicDiceRoller from '/imports/api/engine/action/functions/userInput/getDeterministicDiceRoller';

// This assumes the user's choices are in exactly the order they will be requested
// Dice rolls are done fresh, no cheating
export default function getReplayChoicesInputProvider(actionId: string, decisions: any[]):
  InputProvider {
  const decisionStack = [...decisions].reverse();
  const dRoller = getDeterministicDiceRoller(actionId);
  const replaySavedInput: InputProvider = {
    targetIds() {
      return Promise.resolve(decisionStack.pop());
    },
    nextStep() {
      return Promise.resolve();
    },
    // To roll dice, ignore the user and use the deterministic dice roller again
    rollDice(dice) {
      decisionStack.pop();
      return dRoller(dice);
    },
    choose() {
      return Promise.resolve(decisionStack.pop());
    },
    advantage() {
      return Promise.resolve(decisionStack.pop());
    },
    check() {
      return Promise.resolve(decisionStack.pop());
    },
  }
  return replaySavedInput;
}
