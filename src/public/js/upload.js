(function() {
  const form = document.querySelector('#upload');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;

    const url = form.action;
    const body = new FormData(form);

    if (!body.get('file').size) {
      return;
    }

    fetch(url, {
      method: 'post',
      body
    })
    .then(res => res.json())
    .then(({id, secret}) => {
      const filename = body.get('file').name;
      const url = `/dispatch/${id}/${secret}?name=` + encodeURIComponent(filename);
      window.location = url;
    });
  });
}());
