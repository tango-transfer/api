const AWS = require('aws-sdk');
const GCS = require('@google-cloud/storage');

const Storage = require('./Storage.js');
const DiskAdapter = require('./adapters/Disk.js');
const GCSAdapter = require('./adapters/GCS.js');
const S3Adapter = require('./adapters/S3.js');

function createAdapter() {
  const env = process.env;
  const type = env.STORAGE_ADAPTER;

  if (type === 'gcs') {
    const storage = GCS({
      projectId: env.STORAGE_ADAPTER_GCS_PROJECT_ID,
      keyFilename: env.STORAGE_ADAPTER_GCS_KEYFILE_NAME,
    });

    const bucket = storage.bucket(env.STORAGE_ADAPTER_GCS_BUCKET);
    return new GCSAdapter(bucket)
  }
  else if (type === 's3') {
    console.log('Using S3 Storage Adapter');

    const s3 = new AWS.S3({
      accessKeyId: env.STORAGE_ADAPTER_S3_ACCESS_KEY_ID,
      secretAccessKey: env.STORAGE_ADAPTER_S3_SECRET_ACCESS_KEY,
      sslEnabled: true,
    });

    return new S3Adapter(env.STORAGE_ADAPTER_S3_BUCKET, s3);
  }
  else if (type === 'disk') {
    return new DiskAdapter(env.STORAGE_ADAPTER_PATH);
  }

  throw new Error(`No adapter "${type}" matched.`);
}

function createStorage() {
  const adapter = createAdapter();
  return new Storage(adapter);
}

module.exports = {
  createStorage,
};
