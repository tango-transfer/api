(function() {

  const form = document.querySelector('#upload');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;

    const url = form.action;
    const body = new FormData(form);

    fetch(url, {
      method: 'post',
      body
    })
    .then(res => res.json())
    .then(({id, secret}) => {
      window.location = `/dispatch/${id}/${secret}`;

    });
  });
}());
