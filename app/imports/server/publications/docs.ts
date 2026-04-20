import { Roles } from 'meteor/roles';
import Docs, { type Doc } from '/imports/api/docs/Docs';

Meteor.publish('docs', async function () {
  const filter: Mongo.Selector<Doc> = { published: true, removed: { $ne: true } };
  if (this.userId) {
    if (await Roles.userIsInRoleAsync(this.userId, 'DOCS_EDIT')) {
      delete filter.published;
      delete filter.removed;
    }
  }
  return Docs.find(filter);
});
