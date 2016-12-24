const Transform = require('stream').Transform;

class EmbedHeader extends Transform
{
    constructor(data) {
        super({ decodeStrings: false });
        this.setEncoding(null);

        this._data = data;
        this._finished = true;
    }

    _transform(chunk, encoding, done) {
        if (this._finished) {
            this.push(chunk);
        }
        done();
    }
}

module.exports = EmbedHeader;
