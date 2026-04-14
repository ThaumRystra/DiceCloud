// https://github.com/VeliovGroup/Meteor-Files/blob/master/docs/aws-s3-integration.md
import { FilesCollection } from 'meteor/ostrio:files';
import type { S3FileStorageOptions } from '/imports/api/files/s3FileStorage.types';

const createS3FilesCollection = function ({
  collectionName,
  storagePath,
  onBeforeUpload,
  onAfterUpload,
  debug,// = !Meteor.isProduction,
  allowClientCode = false,
}: S3FileStorageOptions) {
  const collection = new FilesCollection({
    collectionName,
    storagePath,
    onBeforeUpload,
    onAfterUpload,
    debug,
    allowClientCode,
  });

  return collection;
}

export { createS3FilesCollection };
