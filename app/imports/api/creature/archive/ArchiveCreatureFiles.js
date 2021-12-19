import { FilesCollection } from 'meteor/ostrio:files';

const ArchiveCreatureFiles = new FilesCollection({
  collectionName: 'archiveCreatureFiles',
  allowClientCode: false, // Disallow remove files from Client
  storagePath: '/DiceCloud/uploads/',
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
