(function() {
  function countdown(from, onCount, onComplete) {
    function stop() {
      clearInterval(timer);
    }

    onCount(from);

    const timer = setInterval(() => {
      onCount(--from);
      if (from <= 0) {
        onComplete();
        stop();
      }
    }, 1000);

    return stop;
  }

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
        secret: parent.secret,
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

    const stop = countdown(req.timeout, time, ignore);
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
