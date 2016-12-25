(function() {
  const form = document.querySelector('#upload');
  const prog = TFA.progress(document.querySelector('.progress-bar'));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;

    const url = form.action;
    const body = new FormData(form);

    if (!form.file.value) {
      return;
    }

    const filename = form.file.value.split(/(\\|\/)/g).pop();

    const XHR = new XMLHttpRequest();
    XHR.open('POST', url, true);

    XHR.addEventListener('error', function(e) {
      console.error(e);
    });

    XHR.upload.addEventListener('progress', function(e) {
      prog((e.loaded || 0) / (e.total || 1));
    });

    XHR.addEventListener('load', function() {
      prog(1);
      const {id, secret} = JSON.parse(this.responseText);
      const url = `/dispatch/${id}/${secret}?name=` + encodeURIComponent(filename);

      window.location = url;
    });

    XHR.send(body);
  });
}());
