class Client
{
    constructor(conn)
    {
        this.conn = conn;
        this.claims = new Set();
    }

    send(data)
    {
        const msg = JSON.stringify(data);
        console.log(`Sending message ${msg}`);
        this.conn.send(msg, function ack(err) {
            if (err) {
                console.log('Error sending message', msg, err);
            }
        });
    }
}

module.exports = Client;
