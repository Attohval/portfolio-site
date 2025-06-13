function toggleMenu() {
      document.querySelector('.nav-links').classList.toggle('active');
      }

document.addEventListener('DOMContentLoaded', function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  const elements = document.querySelectorAll('.float-in');
  elements.forEach(el => observer.observe(el));
});