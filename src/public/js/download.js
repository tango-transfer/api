(function() {
  const element = document.querySelector('.download');
  const form = element.querySelector('form');

  form.addEventListener('submit', (event) => {
    element.classList.add('requested');
    element.querySelector('h1').textContent = 'Hold on';
    element.querySelector('.signature').textContent = form.sign.value;
  });
}());
