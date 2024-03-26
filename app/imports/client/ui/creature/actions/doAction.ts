import { insertAction } from '/imports/api/engine/action/methods/insertAction';

export default async function doAction(prop: any, $store, elementId) {
  const actionId = await insertAction.call({
    action: {
      creatureId: prop.root.id,
      rootPropId: prop._id,
      results: [],
      taskCount: 0,
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
