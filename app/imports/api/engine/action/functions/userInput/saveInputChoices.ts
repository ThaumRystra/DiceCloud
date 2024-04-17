import { EngineAction } from '/imports/api/engine/action/EngineActions';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';

/**
 * Create a new version of the user input function, that saves the user's choices to an array
 * before returning them
 */
export default function saveInputChoices(action: EngineAction, userInput: InputProvider): InputProvider {
  const newInputProvider: Partial<InputProvider> = {};

  if (!action._decisions) {
    action._decisions = [];
  }

  // For every function in the given input provider
  for (const key in userInput) {
    const oldFn = userInput[key];
    // Make a new function that does the same thing, but saves the result to action._decisions
    const newFn = async (...args) => {
      const result = await oldFn(...args);
      action._decisions?.push(result);
      return result;
    }
    newInputProvider[key] = newFn;
  }

  return newInputProvider as InputProvider;
}
