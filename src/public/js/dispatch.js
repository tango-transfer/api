(function() {
  const conn = new WebSocket('ws://localhost:8080/ws/monitor');
  const requests = document.querySelectorAll('.requests');
  const requestTemplate = document.querySelector('template.request');

  function addRequest(parent, req) {
    const item = document
        .importNode(requestTemplate.content, true)
        .children[0];

    item.querySelector('.signature').textContent = req.signature;

    item.querySelector('button[name=allow]').addEventListener('click', () => {
      send({
        type: 'ALLOW',
        id: req.id,
        secret: parent.secret,
      });
      parent.element.removeChild(item);
    });

    item.querySelector('button[name=ignore]').addEventListener('click', () => {
      parent.element.removeChild(item);
    });

    parent.element.appendChild(item);
  }

  function send(data) {
    const msg = JSON.stringify(data);
    console.log('Sending message', msg);
    conn.send(msg);
  }

  const incoming = new Map();

  conn.addEventListener('open', () => {
    [...requests].forEach(element => {
      const receipt = JSON.parse(element.getAttribute('data-receipt'));

      incoming.set(receipt.id, {
        element,
        secret: receipt.secret,
      });

      send({
        type: 'CLAIM',
        id: receipt.id,
      });
    });
  });

  conn.addEventListener('message', event => {
    const payload = JSON.parse(event.data);
    if (payload.type === 'REQUEST') {
      if (incoming.has(payload.id)) {
        const parent = incoming.get(payload.id);
        addRequest(parent, payload);
      }
    }
  });
}());
