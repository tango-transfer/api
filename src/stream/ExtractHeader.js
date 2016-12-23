const Transform = require('stream').Transform;

class ExtractHeader extends Transform
{
    constructor() {
        super({ decodeStrings: false });
        this.setEncoding(null);

        this._buff = '';
        this._finished = false;
    }

    _transform(chunk, encoding, done) {
        if (this._finished) {
            this.push(chunk, encoding);
        } else {
            this._buff += chunk.toString();

            const index = this._buff.indexOf('\n');
            if (index !== -1) {
                const header = this._buff.slice(0, index);
                const data = JSON.parse(header);
                this.emit('decoded', data);

                {
                    const rest = this._buff.slice(index + 1);
                    this.push(rest, encoding);
                    this._buff = null;
                    this._finished = true;
                }
            }
        }
        done();
    }
}

module.exports = ExtractHeader;
