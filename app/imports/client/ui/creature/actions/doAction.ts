//import { insertAction } from '/imports/api/engine/actions/ActionEngine';

export default async function doAction(prop: any, $store, elementId) {
  const actionId = await insertAction.call({
    action: {
      creatureId: prop.ancestors[0].id,
      rootPropId: prop._id,
      taskQueue: [{ propId: prop._id }],
    }
  });
  $store.commit('pushDialogStack', {
    component: 'action-dialog',
    elementId,
    data: {
      actionId,
    },
  });
}
