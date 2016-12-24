const Transform = require('stream').Transform;

class ExtractHeader extends Transform
{
    constructor(maxLen = 2048) {
        super({ decodeStrings: false });
        this.setEncoding(null);

        this._maxLen = maxLen;
        this._buff = '';
        this._finished = false;
    }

    _transform(chunk, encoding, done) {
        if (this._finished) {
            this.push(chunk);
        } else {
            // collect string into buffer
            this._buff += chunk.toString();

            if (this._buff.length > this._maxLen) {
                throw new Error(`No header found within max length ${this._maxLen}`)
            }

            // check if string has newline symbol
            const index = this._buff.indexOf('\n');
            if (index !== -1) {
                const decoded = JSON.parse(this._buff.slice(0, index));
                this.emit('decoded', decoded);

                const data = this._buff.slice(index + 1);
                const chunk = Buffer.from(data, 'utf8');

                // push to stream skipping first line
                this.push(chunk);
                // clear string buffer
                this._buff = null;
                // mark as removed
                this._finished = true;
            }
        }
        done();
    }
}

module.exports = ExtractHeader;
