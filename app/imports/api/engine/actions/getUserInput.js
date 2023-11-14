import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { set } from 'lodash';

// Reminder: throwStubExceptions: true is the default, and only
// possible when run() is not async
// For async run() stub exceptions never stop the client from sending
// the call to the server

// Dict of invocationId: {steps: {earlyAnswers, resolve, reject}}
// either resolve functions waiting for the user's input or early answers that were provided
// before the resolves could be set up
let userInputRequests = {};
let provideUserInput;

if (Meteor.isClient) {
  provideUserInput = function (invocationId, step, answers, callback) {
    Meteor.call('answerUserInputRequest', { invocationId, step, answers }, callback);
    // Do the same work on the client without using a stub
    answerInputRequestWork({ invocationId, step, answers });
  }
}

export { userInputRequests, provideUserInput };

export default async function getUserInput(questions, actionContext) {
  // get the invocation details from the action context
  const invocationId = actionContext.invocationId;
  const step = actionContext.userInputStep;
  actionContext.userInputStep += 1; // increment userInput step every time

  // If the answers are already waiting, just return them
  if (userInputRequests[invocationId]?.[step]?.earlyAnswers) {
    return userInputRequests[invocationId][step].earlyAnswers;
  }
  // On the client, store the questions to be answered
  if (Meteor.isClient) {
    set(userInputRequests, `${invocationId}[${step}]`, { questions });
  }
  // Create a place for the answers to go when they are provided
  return new Promise((resolve, reject) => {
    set(userInputRequests, `${invocationId}[${step}]`, { resolve, reject });
  });
}

function answerInputRequestWork({ invocationId, step, answers }) {
  console.log('running answerUserInputRequest');
  const invocation = userInputRequests[invocationId];
  if (!invocation) {
    // Call order on the server is guaranteed, so the invocation must have been created
    // Before we can update it
    throw new Meteor.Error('Not found', 'The method this answer is updating does not exist');
  }
  if (invocation[step]?.resolve) {
    // If there is a resolve waiting for this response, provide it
    invocation[step].resolve(answers);
  } else {
    // Otherwise just store the response as early answers
    invocation[step] = {
      earlyAnswers: answers
    };
  }
}

if (Meteor.isServer) {
  // This function is not defined on the client so that it has no stub function
  // This allows it to be called while still simulating an awaited async method
  // See https://guide.meteor.com/2.8-migration.html#the-limitations
  new ValidatedMethod({
    name: 'answerUserInputRequest',
    validate: new SimpleSchema({
      invocationId: SimpleSchema.RegEx.Id,
      step: SimpleSchema.Integer,
      answers: {
        type: Object,
        blackbox: true,
      },
    }).validator(),
    applyOptions: {
      throwStubExceptions: false,
    },
    mixins: [RateLimiterMixin],
    rateLimit: {
      numRequests: 20,
      timeInterval: 5000,
    },
    run: answerInputRequestWork,
  });
}
