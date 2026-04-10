import Docs, { type Doc } from '/imports/api/docs/Docs';

Meteor.publish('docs', function () {
  const filter: Mongo.Selector<Doc> = { published: true, removed: { $ne: true } };
  if (this.userId) {
    const user = Meteor.users.findOne(this.userId, {
      fields: {
        'roles': 1,
      }
    });
    if (user?.roles?.includes('docsWriter')) {
      delete filter.published;
      delete filter.removed;
    }
  }
  return Docs.find(filter);
});
