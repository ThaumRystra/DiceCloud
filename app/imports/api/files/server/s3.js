import S3 from 'aws-sdk/clients/s3';

export default function () {
  return new S3(...arguments);
}
