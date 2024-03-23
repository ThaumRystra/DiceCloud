// https://github.com/VeliovGroup/Meteor-Files/blob/master/docs/aws-s3-integration.md
import { Meteor } from 'meteor/meteor';
import { each, clone } from 'lodash';
import { Random } from 'meteor/random';
import { FileObj, FileRef, FilesCollection, FilesCollectionConfig } from 'meteor/ostrio:files';
import stream from 'stream';
import { S3 } from '@aws-sdk/client-s3';

/* See fs-extra and graceful-fs NPM packages */
/* For better i/o performance */
import fs from 'fs';
import { promises as fsp } from 'fs';

/* Example: S3='{"s3":{"key": "xxx", "secret": "xxx", "bucket": "xxx", "endpoint": "xxx""}}' meteor */
if (process.env.S3) {
  Meteor.settings.s3 = JSON.parse(process.env.S3).s3;
}

const s3Conf = Meteor.settings.s3 || {};
Meteor.settings.useS3 = !!(
  s3Conf && s3Conf.key && s3Conf.secret && s3Conf.bucket && s3Conf.endpoint
);

const bound = Meteor.bindEnvironment((callback: () => any) => {
  return callback();
});

let createS3FilesCollection;

type S3Metadata = {
  pipePath: string,
}

type S3FilesCollection = FilesCollection<S3Metadata> & {
  readJSONFile?: (file: FileObj<S3Metadata>) => Promise<any>
};

/* Check settings existence in `Meteor.settings` */
/* This is the best practice for app security */
if (Meteor.settings.useS3) {
  // Create a new S3 object
  const s3 = new S3({
    credentials: {
      accessKeyId: s3Conf.key,
      secretAccessKey: s3Conf.secret,
    },
    endpoint: s3Conf.endpoint,
    tls: true,
    maxAttempts: 10,
  });

  createS3FilesCollection = function ({
    collectionName,
    storagePath,
    onBeforeUpload,
    onAfterUpload,
    debug,// = !Meteor.isProduction,
    allowClientCode = false,
  }: {
    collectionName: string,
    storagePath: string,
    onBeforeUpload: (...args: any[]) => any,
    onAfterUpload: (...args: any[]) => any,
    debug: boolean,
    allowClientCode?: boolean,
  }) {
    const filesCollection: S3FilesCollection = new FilesCollection<S3Metadata>({
      collectionName,
      storagePath,
      onBeforeUpload,
      onAfterUpload(fileRef) {
        // Call the provided afterUpload hook first
        onAfterUpload?.(fileRef);

        // Start moving files to AWS:S3
        // after fully received by the Meteor server

        // Run through each of the uploaded file
        each(fileRef.versions, (vRef, version) => {
          // We use Random.id() instead of real file's _id
          // to secure files from reverse engineering on the AWS client
          const filePath = 'files/' + (Random.id()) + '-' + version + '.' + fileRef.extension;

          // Create the AWS:S3 object.
          // Feel free to change the storage class from, see the documentation,
          // `STANDARD_IA` is the best deal for low access files.
          // Key is the file name we are creating on AWS:S3, so it will be like files/XXXXXXXXXXXXXXXXX-original.XXXX
          // Body is the file stream we are sending to AWS
          s3.putObject({
            // ServerSideEncryption: 'AES256', // Optional
            StorageClass: 'STANDARD',
            Bucket: s3Conf.bucket,
            Key: filePath,
            Body: fs.createReadStream(vRef.path),
            ContentType: vRef.type,
          }, (error: Error) => {
            bound(() => {
              if (error) {
                return console.error(error);
              }
              // Update FilesCollection with link to the file at AWS
              // any should actually be Mongo.Modifier<FileObj<S3Metadata>>, but the types aren't quite set up
              // Right for mongo modifiers on version.meta
              const upd: any = {
                $set: {
                  [`versions.${version}.meta.pipePath`]: filePath
                }
              };

              filesCollection.collection.update({
                _id: fileRef._id
              }, upd, undefined, (updError: any) => {
                if (updError) {
                  console.error(updError);
                } else {
                  // Unlink original files from FS after successful upload to AWS:S3
                  filesCollection.unlink(filesCollection.findOne(fileRef._id), version);
                }
              });
            });
          });
        });
      },
      interceptDownload(http: any, fileRef: FileRef<S3Metadata>, version: string) {
        // Intercept access to the file
        // And redirect request to AWS:S3
        let path;

        if (fileRef && fileRef.versions && fileRef.versions[version] && fileRef.versions[version].meta && fileRef.versions[version].meta.pipePath) {
          path = fileRef.versions[version].meta.pipePath;
        }

        if (path) {
          // If file is successfully moved to AWS:S3
          // We will pipe request to AWS:S3
          // So, original link will stay always secure

          // To force ?play and ?download parameters
          // and to keep original file name, content-type,
          // content-disposition, chunked "streaming" and cache-control
          // we're using low-level .serve() method
          const opts: Parameters<typeof s3.getObject>[0] = {
            Bucket: s3Conf.bucket,
            Key: path
          };

          if (http.request.headers.range) {
            const vRef = fileRef.versions[version];
            const range = clone(http.request.headers.range);
            const array = range.split(/bytes=([0-9]*)-([0-9]*)/);
            const start = parseInt(array[1]);
            let end = parseInt(array[2]);
            if (isNaN(end)) {
              // Request data from AWS:S3 by small chunks
              end = (start + (this.chunkSize || 0)) - 1;
              if (end >= vRef.size) {
                end = vRef.size - 1;
              }
            }
            opts.Range = `bytes=${start}-${end}`;
            http.request.headers.range = `bytes=${start}-${end}`;
          }

          const fileColl = this;
          s3.getObject(opts, function (error) {
            if (error) {
              console.error(error);
              if (!http.response.finished) {
                http.response.end();
              }
            } else {
              if (http.request.headers.range && this.httpResponse.headers['content-range']) {
                // Set proper range header in according to what is returned from AWS:S3
                http.request.headers.range = this.httpResponse.headers['content-range'].split('/')[0].replace('bytes ', 'bytes=');
              }

              const dataStream = new stream.PassThrough();
              fileColl.serve(http, fileRef, fileRef.versions[version], version, dataStream);
              dataStream.end(this.data.Body);
            }
          });

          return true;
        }
        // While file is not yet uploaded to AWS:S3
        // It will be served file from FS
        return false;
      },
      debug,
      allowClientCode,
    });
    // Intercept FilesCollection's remove method to remove file from AWS:S3
    const _origRemove = filesCollection.remove;
    filesCollection.remove = function (search) {
      const cursor = this.collection.find(search);
      cursor.forEach((fileRef) => {
        each(fileRef.versions, (vRef) => {
          if (vRef && vRef.meta && vRef.meta.pipePath) {
            // Remove the object from AWS:S3 first, then we will call the original FilesCollection remove
            s3.deleteObject({
              Bucket: s3Conf.bucket,
              Key: vRef.meta.pipePath,
            }, (error: any) => {
              bound(() => {
                if (error) {
                  console.error(error);
                }
              });
            });
          }
        });
      });

      //remove original file from database
      return _origRemove.call(this, search);
    };

    filesCollection.readJSONFile = async function (file: FileObj<S3Metadata>) {
      // If there is the pipepath, use s3 to get the file
      if (file?.versions?.original?.meta?.pipePath) {
        const path = file.versions.original.meta.pipePath;
        const data = await s3.getObject({
          Bucket: s3Conf.bucket,
          Key: path
        });
        if (!data.Body) return;
        return JSON.parse(data.Body.toString());
      } else {
        // Otherwise use the normal filesystem
        const fileString = await fsp.readFile(file.path, 'utf8');
        return JSON.parse(fileString);
      }
    };

    return filesCollection;
  }
} else {
  createS3FilesCollection = function ({
    collectionName,
    storagePath,
    onBeforeUpload,
    onAfterUpload,
    debug,// = !Meteor.isProduction,
    allowClientCode = false,
  }: FilesCollectionConfig<S3Metadata>) {
    const collection: S3FilesCollection = new FilesCollection<S3Metadata>({
      collectionName,
      storagePath,
      onBeforeUpload,
      onAfterUpload,
      debug,
      allowClientCode,
    });

    // Use the normal file system to read files
    collection.readJSONFile = async function (file) {
      const fileString = await fsp.readFile(file.path, 'utf8');
      return JSON.parse(fileString);
    };

    return collection;
  }
}

export { createS3FilesCollection };
