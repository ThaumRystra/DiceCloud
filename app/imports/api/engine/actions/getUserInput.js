import ActiveActions from '/imports/api/creature/actions/ActiveActions';

export default async function getUserInput(questions, actionContext) {
  const activeActionId = actionContext.activeActionId;
  // Set the questions on the active action
  ActiveActions.update(activeActionId, {
    $set: { questions },
    $unset: { answers: 1 },
  });
  // Wait for answers
  return new Promise((resolve, reject) => {
    const observerHandle = ActiveActions.find({
      _id: activeActionId
    }).observeChanges({
      changed(id, fields) {
        // Only watch for answers
        if (!fields.answers) return;
        // Stop watching
        observerHandle.stop();
        // Give answers
        resolve(fields.answers);
      },
      removed() {
        reject('Active action was deleted')
      },
    });
  });
}
