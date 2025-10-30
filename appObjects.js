const images = document.querySelectorAll('.photo-gallery img');
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('img');
const btnPrev = lightbox.querySelector('.prev');
const btnNext = lightbox.querySelector('.next');
const btnClose = lightbox.querySelector('.close');
const backButton = document.querySelector('.back-home');

let currentGroupImages = [];
let currentIndex = 0;
let imageCache = {};  // Объект для кэширования изображений

images.forEach(img => {
  img.addEventListener('click', () => {
    const group = img.closest('.photo-gallery').dataset.group;
    currentGroupImages = Array.from(document.querySelectorAll(`.photo-gallery[data-group="${group}"] img`));
    currentIndex = currentGroupImages.indexOf(img);
    openLightbox();
  });
});

function openLightbox() {
  lightbox.classList.add('active');
  updateLightbox();
  backButton.classList.remove('visible');
}

function closeLightbox() {
  lightbox.classList.remove('active');
  backButton.classList.add('visible');
}

function updateLightbox() {
  const newSrc = currentGroupImages[currentIndex].getAttribute('data-full');

  // Проверяем, если изображение уже загружено, используем его из cache
  if (imageCache[newSrc]) {
    lightboxImg.src = imageCache[newSrc];  // Используем изображение из кэша
  } else {
    lightboxImg.src = newSrc;
    imageCache[newSrc] = newSrc;  // Сохраняем изображение в кэш
  }
}

btnPrev.addEventListener('click', e => {
  e.stopPropagation();
  currentIndex = (currentIndex - 1 + currentGroupImages.length) % currentGroupImages.length;
  updateLightbox();
});

btnNext.addEventListener('click', e => {
  e.stopPropagation();
  currentIndex = (currentIndex + 1) % currentGroupImages.length;
  updateLightbox();
});

btnClose.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') btnNext.click();
  if (e.key === 'ArrowLeft') btnPrev.click();
});

window.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => backButton.classList.add('visible'));
});
