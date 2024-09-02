import UserImages from '/imports/api/files/userImages/UserImages';

Meteor.publish('userImages', function () {
  return UserImages.find({
    userId: this.userId,
  }, {
    sort: {
      'meta.createdAt': -1,
      'name': 1,
      'size': -1,
    },
  }).cursor;
});
