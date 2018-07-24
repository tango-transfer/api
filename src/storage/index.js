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
      projectId: '141385452850',
      keyFilename: 'pomle-com-1d6cb19c34cb.json',
    });

    const bucket = storage.bucket('pomle-com.appspot.com');
    return new GCSAdapter(bucket)
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
