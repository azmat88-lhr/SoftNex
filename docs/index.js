document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.menu-btn');
  const navLinks = document.querySelector('nav ul');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }

  document.querySelectorAll('nav ul li a').forEach(link => {
    link.addEventListener('click', (e) => {
      if (navLinks) navLinks.classList.remove('show');
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          history.replaceState(null, '', href);
        }
      }
    });
  });

  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const payload = {
        name: formData.get('name') || form.querySelector('input[placeholder="Your Name"]').value,
        email: formData.get('email') || form.querySelector('input[placeholder="Your Email"]').value,
        message: formData.get('message') || form.querySelector('textarea').value
      };

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          alert('Thank you for contacting SoftNex! We will get back to you soon.');
          form.reset();
        } else {
          alert('Submission failed: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        console.error(err);
        alert('Unable to submit form. Please try again later.');
      }
    });
  }
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="mailto:"]');
    if (!link) return;
    e.preventDefault();
    const email = link.getAttribute('href').replace(/^mailto:/i, '');
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);

    if (isIOS) {
      window.location.href = `mailto:${email}`;
      return;
    }
    if (isAndroid) {
      const gmailScheme = `googlegmail://co?to=${encodeURIComponent(email)}`;
      const mailto = `mailto:${email}`;
      let fallbackTimer = null;

      try {
        fallbackTimer = setTimeout(() => {
          window.location.href = mailto;
        }, 700);
        window.location.href = gmailScheme;
        const onVisibility = () => {
          clearTimeout(fallbackTimer);
          document.removeEventListener('visibilitychange', onVisibility);
        };
        document.addEventListener('visibilitychange', onVisibility);
      } catch (err) {
        if (fallbackTimer) clearTimeout(fallbackTimer);
        window.location.href = mailto;
      }
      return;
    }

    window.location.href = `mailto:${email}`;
  });

  const brandLink = document.querySelector('.logo[href^="#"]');
  if (brandLink) {
    brandLink.addEventListener('click', (e) => {
      const targetId = brandLink.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
          history.replaceState(null, '', targetId);
        }
      }
    });
  }

  // Team card modal behavior
  const teamCards = document.querySelectorAll('.team-card');
  if (teamCards.length) {
    const createModal = ({ img, name, role, skills, bio }) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true">
          <button class="modal-close" aria-label="Close">&times;</button>
          <div class="modal-head">
            <img src="${img}" class="modal-img" alt="${name}" />
            <div>
              <h3 class="modal-name">${name}</h3>
              <p class="modal-role">${role}</p>
              <div class="modal-skills">${skills.map(s => `<span class="skill">${s}</span>`).join(' ')}</div>
            </div>
          </div>
          <p class="modal-bio">${bio || ''}</p>
        </div>
      `;

      overlay.addEventListener('click', (ev) => {
        if (ev.target === overlay || ev.target.classList.contains('modal-close')) {
          overlay.remove();
        }
      });
      document.body.appendChild(overlay);
      const closeBtn = overlay.querySelector('.modal-close');
      if (closeBtn) closeBtn.focus();
    };

    teamCards.forEach(card => {
      card.addEventListener('click', () => {
        const imgEl = card.querySelector('.team-img');
        const img = imgEl ? imgEl.getAttribute('src') : '';
        const name = card.querySelector('.team-name')?.textContent || '';
        const role = card.querySelector('.team-role')?.textContent || '';
        const skills = Array.from(card.querySelectorAll('.skills li')).map(li => li.textContent.trim());
        const bio = card.dataset.bio || '';
        createModal({ img, name, role, skills, bio });
      });
    });
  }
});
