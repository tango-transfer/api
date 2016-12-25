(function() {
  const element = document.querySelector('.download');
  const form = element.querySelector('form');
  const prog = TFA.progress(document.querySelector('.progress-bar'));
  const goToStep = TFA.stepper(element);

  function ready(url) {
    goToStep('ready');
    element.querySelector('.blob-link').href = url;
  }

  function request(url, sign) {
    goToStep('waiting');

    element.querySelector('.signature').textContent = form.sign.value;

    const XHR = new XMLHttpRequest();
    XHR.open('GET', url + '?sign=' + encodeURIComponent(sign), true);
    XHR.responseType = 'arraybuffer';

    XHR.addEventListener('error', function(e) {
      console.error(e);
    });

    XHR.addEventListener('progress', function(e) {
      goToStep('downloading');
      prog((e.loaded || 0) / (e.total || 1));
    });

    XHR.addEventListener('load', function() {
      const res = this;
      const mime = res.getResponseHeader('content-type');

      if (res.status === 200) {
        const filename = res.getResponseHeader('x-filename');

        const blob = new Blob([res.response], {type: mime});
        const url = URL.createObjectURL(blob);

        const step = element.querySelector('.step.ready');
        step.querySelector('.filename').textContent = filename;

        const link = step.querySelector('a');
        link.download = filename;
        link.href = url;

        goToStep('ready');
      } else {
        const loc = res.getResponseHeader('location');
        if (loc) {
          window.location = loc;
        }
      }
    });

    XHR.send();
  }


  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const url = form.action;
    request(url, form.sign.value);
  });

  goToStep('requesting');
}());
