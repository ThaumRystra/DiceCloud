import UserImages from '/imports/api/files/userImages/UserImages';

Meteor.publish('userImages', function () {
  if (!this.userId) {
    return this.error(new Meteor.Error('logged-out', 'You must be logged in to see your images'));
  }
  return UserImages.find({
    userId: this.userId,
  }, {
    sort: {
      'meta.createdAt': -1,
      'name': 1,
      'size': -1,
    },
  });
});
