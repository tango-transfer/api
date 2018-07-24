class S3
{
  constructor(bucket, backend) {
    this.bucket = bucket;
    this.backend = backend;
  }

  getStream(id) {
    return this.backend.getObject({
       Bucket: this.bucket,
       Key: id,
    }).createReadStream();
  }

  putStream(input, id) {
    this.backend.upload({
      Bucket: this.bucket,
      Key: id,
      ACL: "private",
      Body: input,
    },
    (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      console.info('Stored', data);
    });

    return input;
  }
}

module.exports = S3;
