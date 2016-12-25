const uuid = require('uuid/v4');
const requestAccess = require('./ws/requestAccess');

class Coordinator {
  constructor(store) {
    this.store = store;
    this.owners = new Map();
  }

  claim(id, secret, client) {
    return this.store.check(id, secret)
    .then(isValid => {
      if (!isValid) {
        return;
      }

      if (!this.owners.has(id)) {
        this.owners.set(id, new Set());
      }

      const owners = this.owners.get(id);
      owners.add(client);

      console.info('%d owners for %s', owners.size, id);
    });
  }

  release(id, client) {
    if (!this.owners.has(id)) {
      return;
    }

    const owners = this.owners.get(id);
    owners.delete(client);

    console.info('%d owners for %s', owners.size, id);

    if (owners.size === 0) {
      this.owners.delete(id);
    }
  }

  request(id, signature = null) {
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
