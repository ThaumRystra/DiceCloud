// https://github.com/VeliovGroup/Meteor-Files/blob/master/docs/aws-s3-integration.md
import { FilesCollection } from 'meteor/ostrio:files';

const createS3FilesCollection = function ({
  collectionName,
  storagePath,
  onBeforeUpload,
  onAfterUpload,
  debug,// = !Meteor.isProduction,
  allowClientCode = false,
}) {
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
