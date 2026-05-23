const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const header = qs(".site-header");
const menuToggle = qs(".menu-toggle");
const navLinks = qs(".nav-links");
const backToTop = qs(".back-to-top");

// Mobile navigation is shared by every page.
const closeMenu = () => {
  navLinks?.classList.remove("open");
  menuToggle?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
};

// Keep the transparent header and back-to-top button in sync with scroll depth.
const setHeaderState = () => {
  header?.classList.toggle("scrolled", window.scrollY > 20);
  backToTop?.classList.toggle("visible", window.scrollY > 520);
};

menuToggle?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-open", isOpen);
});

qsa(".nav-links a").forEach((link) => link.addEventListener("click", closeMenu));

window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();

backToTop?.addEventListener("click", (event) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

qsa("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// Reveal cards and page sections only once to keep the UI calm and fast.
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

qsa(".reveal").forEach((el) => revealObserver.observe(el));

const typingTarget = qs("[data-typing]");
if (typingTarget) {
  const words = JSON.parse(typingTarget.dataset.typing);
  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const type = () => {
    const word = words[wordIndex];
    typingTarget.textContent = word.slice(0, charIndex);

    if (!deleting && charIndex < word.length) {
      charIndex += 1;
      setTimeout(type, 70);
      return;
    }

    if (!deleting && charIndex === word.length) {
      deleting = true;
      setTimeout(type, 1200);
      return;
    }

    if (deleting && charIndex > 0) {
      charIndex -= 1;
      setTimeout(type, 38);
      return;
    }

    deleting = false;
    wordIndex = (wordIndex + 1) % words.length;
    setTimeout(type, 260);
  };

  type();
}

// Animated counters run when the stats block becomes visible.
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    qsa("[data-count]", entry.target).forEach((counter) => {
      const target = Number(counter.dataset.count);
      const suffix = counter.dataset.suffix || "";
      const duration = 1100;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const value = Math.floor(progress * target);
        counter.textContent = `${value}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    });

    counterObserver.unobserve(entry.target);
  });
}, { threshold: 0.3 });

qsa("[data-counter-scope]").forEach((scope) => counterObserver.observe(scope));

qsa("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    qsa("[data-filter]").forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    qsa("[data-category]").forEach((card) => {
      const categories = card.dataset.category.split(" ");
      const visible = filter === "all" || categories.includes(filter);
      card.hidden = !visible;
    });
  });
});

// Skill bars and rings animate only when the skills page enters the viewport.
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    qsa("[data-skill]", entry.target).forEach((bar) => {
      bar.style.width = `${bar.dataset.skill}%`;
    });

    qsa("[data-circle]", entry.target).forEach((circle) => {
      const value = Number(circle.dataset.circle);
      let current = 0;
      const label = qs("span", circle);

      const draw = () => {
        current += Math.max(1, Math.ceil((value - current) / 10));
        const degrees = current * 3.6;
        circle.style.background = `conic-gradient(var(--primary) ${degrees}deg, rgba(255,255,255,0.1) ${degrees}deg)`;
        if (label) label.textContent = `${Math.min(current, value)}%`;
        if (current < value) requestAnimationFrame(draw);
      };

      draw();
    });

    skillObserver.unobserve(entry.target);
  });
}, { threshold: 0.24 });

qsa("[data-skills-scope]").forEach((scope) => skillObserver.observe(scope));

const contactForm = qs("[data-contact-form]");
const formMessage = qs("[data-form-message]");

contactForm?.addEventListener("submit", (event) => {
  const name = qs("#name", contactForm);
  const email = qs("#email", contactForm);
  const message = qs("#message", contactForm);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());

  if (name.value.trim().length < 2 || !validEmail || message.value.trim().length < 12) {
    event.preventDefault();
    formMessage.textContent = "Please enter a valid name, email, and message of at least 12 characters.";
    formMessage.classList.add("error");
    return;
  }

  formMessage.textContent = "Sending your message...";
  formMessage.classList.remove("error");
});
