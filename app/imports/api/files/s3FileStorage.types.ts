import type { ContextUpload, ContextUser, FileData, FileObj } from 'meteor/ostrio:files';

export type S3FileStorageOptions = {
  collectionName: string,
  storagePath: string,
  onBeforeUpload: (this: ContextUpload & ContextUser, fileData: FileData) => string | boolean,
  onAfterUpload: (fileObj: FileObj) => void,
  debug?: boolean,
  allowClientCode?: boolean,
}
