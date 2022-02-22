import { createS3FilesCollection } from '/imports/api/files/s3FileStorage.js';

const ArchiveCreatureFiles = createS3FilesCollection({
  collectionName: 'archiveCreatureFiles',
  storagePath: Meteor.isDevelopment ? '/DiceCloud/archiveCreatures/' : 'assets/app/archiveCreatures',
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in json format
    if (file.size > 10485760) {
      return 'Please upload with size equal or less than 10MB';
    }
    if (!/json/i.test(file.extension)){
      return 'Please upload only a JSON file';
    }
  }
});

export default ArchiveCreatureFiles;
