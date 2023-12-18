import UserImages from '/imports/api/files/UserImages';

Meteor.publish('userImages', function () {
  return UserImages.find({
    userId: this.userId,
  }).cursor;
});
