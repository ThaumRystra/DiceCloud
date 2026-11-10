// https://github.com/VeliovGroup/Meteor-Files/blob/master/docs/aws-s3-integration.md
import { Meteor } from 'meteor/meteor';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { promises as fsp } from 'fs';

type S3Env = {
  key: string,
  secret: string,
  bucket: string,
  endpoint: string,
}

/* Example: S3='{"s3":{"key": "xxx", "secret": "xxx", "bucket": "xxx", "endpoint": "xxx""}}' meteor */
if (process.env.S3) {
  Meteor.settings.s3 = (JSON.parse(process.env.S3) as S3Env);
}

const s3Conf = Meteor.settings.s3 as S3Env || {};
const useS3 = !!(
  s3Conf && s3Conf.key && s3Conf.secret && s3Conf.bucket && s3Conf.endpoint
);
Meteor.settings.useS3 = useS3;

const s3 = new S3({
  credentials: {
    accessKeyId: s3Conf.key,
    secretAccessKey: s3Conf.secret,
  },
  region: 'ENAM',
  endpoint: s3Conf.endpoint,
  tls: true,
  maxAttempts: 3,
});
 
export function writeJsonFile(Key: string, Body: string){
  if (useS3) {
    return writeJsonFileS3(Key, Body);
  } else {
    return writeJsonFileSys(Key, Body);
  }
}

export function readJsonFile(Key: string){
  if (useS3) {
    return readJsonFileS3(Key);
  } else {
    return readJsonFileSys(Key);
  }
}

export function deleteJsonFile(Key: string){
  if (useS3) {
    return deleteJsonFileS3(Key);
  } else {
    return deleteJsonFileSys(Key);
  }
}

function writeJsonFileS3(Key: string, Body: string){
  const command = new PutObjectCommand({
    StorageClass: 'STANDARD',
    Bucket: s3Conf.bucket,
    Key,
    Body,
    ContentType: 'application/json',
  });
  return s3.send(command);
}

function readJsonFileS3(Key: string){
  const command = new GetObjectCommand({
    Bucket: s3Conf.bucket,
    Key,
  });
  return s3.send(command);
}

function deleteJsonFileS3(Key: string){
  const command = new DeleteObjectCommand({
    Bucket: s3Conf.bucket,
    Key,
  });
  return s3.send(command)
}

function writeJsonFileSys(Key: string, Body: string){
  //TODO
}

function readJsonFileSys(Key: string){
  //TODO
}

async function deleteJsonFileSys(Key: string){
  const fileString = await fsp.readFile(Key, 'utf8');
  return JSON.parse(fileString) as unknown;
}
