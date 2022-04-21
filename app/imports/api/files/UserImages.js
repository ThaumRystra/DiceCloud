import { createS3FilesCollection } from '/imports/api/files/s3FileStorage.js';

const UserImages = createS3FilesCollection({
  collectionName: 'userImages',
  storagePath: Meteor.isDevelopment ? '/DiceCloud/userImages/' : 'assets/app/userImages',
  onBeforeUpload(file) {
    // Allow upload files under 10MB
    if (file.size > 10485760) {
      return 'Please upload with size equal or less than 10MB';
    }
    // Allow common image extensions
    if (/gif|png|jpe?g|webp/i.test(file.extension || '')) {
      return 'Please upload an image file only';
    }
  }
});

export default UserImages;
