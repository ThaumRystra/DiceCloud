import UserImages from '/imports/api/files/UserImages.js';

Meteor.publish('userImages', function () {
  return UserImages.find({
    userId: this.userId,
  }).cursor;
});
