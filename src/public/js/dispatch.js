(function() {
  function addRequest(parent, req) {
    const item = document
        .importNode(requestTemplate.content, true)
        .children[0];

    function time(seconds) {
      item.querySelector('.timeout').textContent = seconds;
    }

    function allow() {
      send({
        type: 'ALLOW',
        id: req.id,
        secret: getSecret(req.id),
      });

      stop();
      item.classList.add('allowed');
    }

    function ignore() {
      stop();
      parent.element.removeChild(item);
    }

    item.querySelector('.signature').textContent = req.signature;

    item.querySelector('button[name=allow]')
        .addEventListener('click', allow);

    item.querySelector('button[name=ignore]')
        .addEventListener('click', ignore);

    parent.element.appendChild(item);

    const stop = TFA.countdown(req.timeout, time, ignore);
  }

  function getSecret(id) {
    return localStorage.getItem(id);
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
      const id = element.getAttribute('data-id');

      incoming.set(id, {
        element,
      });

      send({
        type: 'CLAIM',
        id: id,
        secret: getSecret(id),
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

  const link = document.querySelector('.link');
  const anchor = link.querySelector('a');
  const input = link.querySelector('input');
  const button = link.querySelector('button');
  anchor.textContent = anchor.href;

  button.addEventListener('click', () => {
    input.value = anchor.href;
    input.select();
    document.execCommand('cut');
    input.blur();
  });

  document.addEventListener('copy', function(event) {
    event.preventDefault();
    event.clipboardData.setData('text/plain', link.href);
  });

  const requests = document.querySelectorAll('.requests');
  const requestTemplate = document.querySelector('template.request');
}());
