import { createS3FilesCollection } from '/imports/api/files/s3FileStorage.js';
import SimpleSchema from 'simpl-schema';
import { incrementFileStorageUsed } from '/imports/api/users/methods/updateFileStorageUsed.js';

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
    return true;
  },
  onAfterUpload(file) {
    incrementFileStorageUsed(file.userId, file.size);
  }
});

let archiveSchema = new SimpleSchema({
  meta: {
    type: Object,
    blackbox: true,
  },
  creature: {
    type: Object,
    blackbox: true,
  },
  properties: {
    type: Array,
  },
  'properties.$': {
    type: Object,
    blackbox: true,
  },
  experiences: {
    type: Array,
  },
  'experiences.$': {
    type: Object,
    blackbox: true,
  },
  logs: {
    type: Array,
  },
  'logs.$': {
    type: Object,
    blackbox: true,
  },
});

export default ArchiveCreatureFiles;
export { archiveSchema };
