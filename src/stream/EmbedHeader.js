const Transform = require('stream').Transform;

class EmbedHeader extends Transform
{
    constructor(data = {}) {
        super({ decodeStrings: false });
        this.setEncoding(null);

        this._data = data;
        this._finished = false;
    }

    _transform(chunk, encoding, done) {
        if (!this._finished) {
            const header = JSON.stringify(this._data);
            this.push(header + '\n', 'utf8');
            this._finished = true;
        }
        this.push(chunk, encoding);
        done();
    }
}

module.exports = EmbedHeader;
