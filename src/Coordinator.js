const uuid = require('uuid/v4');
const requestAccess = require('./ws/requestAccess');

class Coordinator {
  constructor(store) {
    this.store = store;
    this.owners = new Map();
  }

  claim(id, client) {
    if (!this.owners.has(id)) {
      this.owners.set(id, new Set());
    }

    this.owners.get(id).add(client);

    console.log(this.owners);
  }

  release(id, client) {
    if (!this.owners.has(id)) {
      return;
    }

    const owners = this.owners.get(id);
    owners.delete(client);

    if (owners.size === 0) {
      this.owners.delete(id);
    }

    console.log(this.owners);
  }

  request(id, signature = '1234') {
    return new Promise(resolve => {
      if (!this.owners.has(id)) {
        throw new Error(`No owner for ${id}`);
      }

      resolve(this.owners.get(id));
    })
    .then(owners => {
      return Promise.race([...owners].map(client => {
        return requestAccess(client, id, signature);
      }));
    })
    .then(secret => {
      return this.store.retrieve(id, secret);
    });
  }
}

module.exports = Coordinator;