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

  function progress(e) {
    const bar = e.querySelector('.progress');
    const text = e.querySelector('.text');
    return function update(f) {
      const p = f * 100;
      text.textContent = p.toFixed(1) + '%';
      bar.style.width = p + '%';
    }
  }

  function stepper(e) {
    let last;
    return function to(next) {
      if (next !== last) {
        e.classList.remove(last);
        e.classList.add(next);
        last = next;
      }
    }
  }

  window.TFA = {
    countdown,
    progress,
    stepper,
  }
}());
