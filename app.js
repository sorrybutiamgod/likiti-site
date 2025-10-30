(function(){
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const track = document.querySelector('.carousel-track');
  if (!track) return;

  // если набор не дублирован — дублируем элементы для бесшовной прокрутки
  if (!track.dataset.duplicated) {
    const items = Array.from(track.children);
    items.forEach(n => track.appendChild(n.cloneNode(true)));
    track.dataset.duplicated = '1';
  }

  // базовые параметры (подберите по вкусу)
  let normalDuration = 25;  // секунда — полная прокрутка половины трека (как раньше)
  let hoverDuration  = 60;  // секунда — медленнее при наведении
  const smoothMs     = 300; // плавность интерполяции скорости (мс)

  let widthHalf = Math.round(track.scrollWidth / 2); // расстояние прокрутки в px
  let pos = 0;           // текущая смещённая в px позиция (0..widthHalf)
  let last = performance.now();

  // скорость в px/сек
  function speedForDuration(durSec){
    return widthHalf / Math.max(0.001, durSec);
  }

  let speedTarget = speedForDuration(normalDuration);
  let speed = speedTarget;
  let speedStart = speed;
  let speedAnimStart = null;

  // при ресайзе пересчитываем размеры
  function recalc(){
    widthHalf = Math.round(track.scrollWidth / 2);
    // держим pos в допустимых пределах
    pos = ((pos % widthHalf) + widthHalf) % widthHalf;
    // обновляем таргетную скорость (чтобы соответствовать новым размерам)
    speedTarget = speedForDuration(normalDuration);
  }
  window.addEventListener('resize', recalc);
  recalc();

  // простая easeInOutQuad
  function ease(t){ return t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; }

  // анимационный цикл — управляет transform напрямую
  function frame(now){
    const dt = Math.min(100, now - last) / 1000; // секунды (защита от прыжков)
    last = now;

    // интерполируем скорость к target плавно
    if (speed !== speedTarget) {
      if (!speedAnimStart) { speedAnimStart = now; speedStart = speed; }
      const t = Math.min(1, (now - speedAnimStart) / smoothMs);
      const tt = ease(t);
      speed = speedStart + (speedTarget - speedStart) * tt;
      if (t === 1) { speedAnimStart = null; speedStart = speed; }
    }

    pos += speed * dt;             // двигаем вперёд на px
    if (pos >= widthHalf) pos -= widthHalf; // зациклить (поскольку элементы дублированы)
    // применяем смещение
    track.style.transform = `translateX(${-Math.round(pos)}px)`;

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  // hover handlers — изменяют таргетную скорость (и плавно интерполируют)
  track.addEventListener('mouseenter', () => {
    // пересчитать размеры на случай изменения layout
    recalc();
    speedTarget = speedForDuration(hoverDuration);
    speedAnimStart = null;
  });

  track.addEventListener('mouseleave', () => {
    recalc();
    speedTarget = speedForDuration(normalDuration);
    speedAnimStart = null;
  });

})();
(function(){
  // проставляем aria-label ссылкам по alt изображений
  document.querySelectorAll('.carousel-track .carousel-link').forEach(link => {
    const img = link.querySelector('img');
    if (img && img.alt && !link.getAttribute('aria-label')) {
      link.setAttribute('aria-label', img.alt);
    }
    // предотвратить "перетаскивание" изображения (дополнительно улучшает UX)
    if (img) {
      img.setAttribute('draggable', 'false');
    }
  });

  // (Опция) если хотите, чтобы клик по ссылке открывался в новой вкладке:
  // document.querySelectorAll('.carousel-track .carousel-link').forEach(a => a.setAttribute('target','_blank'));
})();

(function(){
  // если пользователь предпочитает reduced motion — оставляем стандартное поведение
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var hash = a.getAttribute('href');
    if (!hash || hash === '#') return;
    var target = document.querySelector(hash);
    if (!target) return;

    e.preventDefault();

    var header = document.querySelector('.navbar') || document.querySelector('header');
    var headerH = header ? header.getBoundingClientRect().height : 0;

    var y = target.getBoundingClientRect().top + window.pageYOffset - headerH;

    window.scrollTo({ top: Math.round(y), behavior: 'smooth' });

    try {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    } catch (err) { /* ignore */ }
  }, false);
  })();

document.querySelector("form").addEventListener("submit", function(e) {
  e.preventDefault();

  var formData = new FormData(this);
  var name = formData.get("name");
  var phone = formData.get("phone");
  var email = formData.get("email");
  var message = formData.get("message");

  var text = `Новая заявка:\n\nИмя: ${name}\nТелефон: ${phone}\nEmail: ${email}\nСообщение: ${message}`;

  fetch('/api/send_message', {
    method: 'POST',
    headers: {  
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name,
      phone: phone,
      email: email,
      message: message
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === "Заявка отправлена!") {
      window.location.href = "zayavka.html"; // Перенаправление на страницу
    } else {
      alert("Ошибка отправки заявки.");
    }
  })
  .catch(error => {
    alert("Ошибка отправки заявки.");
    console.error(error);
  });
});
