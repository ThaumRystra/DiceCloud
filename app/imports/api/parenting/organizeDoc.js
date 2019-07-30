import { updateParent } from '/imports/api/parenting/parenting.js';

export default function organizeDoc({docRef, parentRef, order}){
  updateParent({docRef, parentRef});
  updateOrder({docRef, order})
};
