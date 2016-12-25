(function() {
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

      item.classList.add('allowed');
    });

    item.querySelector('button[name=ignore]').addEventListener('click', () => {
      parent.element.removeChild(item);
    });

    parent.element.appendChild(item);
  }

  function send(data) {
    const msg = JSON.stringify(data);
    conn.send(msg);
  }

  const loc = window.location;
  const conn = new WebSocket(`wss://${loc.hostname}:${loc.port}/ws/monitor`);
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
        secret: receipt.secret,
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

  [...document.querySelectorAll('.link a')].forEach(anchor => {
    anchor.textContent = anchor.href;
  });

  const requests = document.querySelectorAll('.requests');
  const requestTemplate = document.querySelector('template.request');
}());
