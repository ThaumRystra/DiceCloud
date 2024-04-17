import UserImages from '/imports/api/files/userImages/UserImages';

Meteor.publish('userImages', function () {
  return UserImages.find({
    userId: this.userId,
  }).cursor;
});
