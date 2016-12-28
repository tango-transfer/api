(function() {
  function sendFile(file) {
    const body = new FormData();
    body.append('file', file);

    const XHR = new XMLHttpRequest();
    XHR.open('POST', url, true);

    XHR.addEventListener('error', function(err) {
      console.error(err);
    });

    XHR.upload.addEventListener('progress', function(e) {
      prog((e.loaded || 0) / (e.total || 1));
    });

    XHR.addEventListener('load', function() {
      const {id, secret} = JSON.parse(this.responseText);
      const url = `/dispatch/${id}?name=` + encodeURIComponent(file.name);
      localStorage.setItem(id, secret);
      window.location = url;
    });

    XHR.send(body);
  }

  function handleFiles(files) {
    if (files.length === 0) {
      return;
    }
    sendFile(files[0]);
  }

  const form = document.querySelector('#upload');
  const url = form.action;
  const prog = TFA.progress(document.querySelector('.progress-bar'));

  document.addEventListener('dragover', (event) => {
    event.preventDefault();
  });

  document.addEventListener('drop', (event) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handleFiles(form.file.files);
  });
}());
