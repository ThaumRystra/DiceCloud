let createS3FilesCollection;
if (Meteor.isServer) {
  createS3FilesCollection = require('/imports/api/files/server/s3FileStorage.js').createS3FilesCollection
} else {
  createS3FilesCollection = require('/imports/api/files/client/s3FileStorage.js').createS3FilesCollection
}

const UserImages = createS3FilesCollection({
  collectionName: 'userImages',
  storagePath: Meteor.isDevelopment ? '../../../../../fileStorage/userImages' : 'assets/app/userImages',
  onBeforeUpload(file) {
    // Allow upload files under 10MB
    if (file.size > 10485760) {
      return 'Please upload with size equal or less than 10MB';
    }
    // Allow common image extensions
    if (!/gif|png|jpe?g|webp/i.test(file.extension || '')) {
      return 'Please upload an image file only';
    }
    return true
  }
});

export default UserImages;
