document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.menu-btn');
  const navLinks = document.querySelector('nav ul');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }

  // Beautiful notification / toast component
  const showNotification = ({ title = '', message = '', type = 'info', timeout = 5000 } = {}) => {
    let container = document.querySelector('.sn-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'sn-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `sn-toast ${type}`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      <div class="sn-toast-icon" aria-hidden="true">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</div>
      <div class="sn-toast-body">
        <div class="sn-toast-title">${title}</div>
        <div class="sn-toast-message">${message}</div>
      </div>
      <button class="sn-toast-close" aria-label="Dismiss">×</button>
    `;

    const close = () => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 350);
    };

    toast.querySelector('.sn-toast-close').addEventListener('click', close);
    container.appendChild(toast);

    // Auto dismiss
    if (timeout > 0) {
      setTimeout(close, timeout);
    }
  };

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


  document.addEventListener('submit', async (e) => {
    const form = e.target;
    if (!form || form.tagName !== 'FORM') return;
    e.preventDefault();
    const formData = new FormData(form);
    const payload = {
      name: formData.get('name') || form.querySelector('input[placeholder="Your Name"]')?.value || '',
      email: formData.get('email') || form.querySelector('input[placeholder="Your Email"]')?.value || '',
      message: formData.get('message') || form.querySelector('textarea')?.value || ''
    };
    const resultDiv = document.getElementById('submission-result');
    const escapeHtml = (s) => String(s).replace(/[&"'<>]/g, (c) => ({'&':'&amp;','"':'&quot;',"'":"&#39;","<":"&lt;",">":"&gt;"}[c]));

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        if (resultDiv) {
          resultDiv.innerHTML = `
            <div class="submission-card" role="status">
              <div class="submission-card-header">
                <div class="submission-card-icon">✓</div>
                <div>
                  <div class="submission-card-title">Message Sent</div>
                  <div class="submission-card-sub">We've received your message</div>
                </div>
                <button class="submission-close" aria-label="Close result">×</button>
              </div>
              <div class="submission-content">
                <div class="submission-field"><div class="label">Name</div><div class="value">${escapeHtml(payload.name)}</div></div>
                <div class="submission-field"><div class="label">Email</div><div class="value">${escapeHtml(payload.email)}</div></div>
                <div class="submission-field"><div class="label">Message</div><div class="value">${escapeHtml(payload.message)}</div></div>
              </div>
              <div class="submission-actions">
                <button class="btn-ghost" type="button" id="submission-copy">Copy Email</button>
                <button class="btn-primary" type="button" id="submission-ok">Okay</button>
              </div>
              <div class="submission-footer">Where this appears: displayed here on this page and sent to the backend server which logs/stores it.</div>
            </div>
          `;

          // hook up controls
          const closeBtn = resultDiv.querySelector('.submission-close');
          const copyBtn = resultDiv.querySelector('#submission-copy');
          const okBtn = resultDiv.querySelector('#submission-ok');
          const card = resultDiv.querySelector('.submission-card');
          const clearResult = () => { if (card) { card.classList.add('hide'); setTimeout(()=> resultDiv.innerHTML = '', 300); } };
          if (closeBtn) closeBtn.addEventListener('click', clearResult);
          if (okBtn) okBtn.addEventListener('click', clearResult);
          if (copyBtn) copyBtn.addEventListener('click', async () => {
            try {
              await navigator.clipboard.writeText(payload.email || '');
              showNotification({ title: 'Copied', message: 'Email copied to clipboard', type: 'info', timeout: 2200 });
            } catch (err) {
              showNotification({ title: 'Copy failed', message: 'Unable to copy email', type: 'error', timeout: 3000 });
            }
          });
        } else {
          showNotification({
            title: 'Thank you!',
            message: 'Thank you for contacting SoftNex! We will get back to you soon.',
            type: 'success',
            timeout: 4500
          });
        }
        form.reset();
      } else {
        showNotification({
          title: 'Submission failed',
          message: data.error || 'Unknown error',
          type: 'error',
          timeout: 6000
        });
      }
    } catch (err) {
      console.error(err);
      showNotification({
        title: 'Error',
        message: 'Unable to submit form. Please try again later.',
        type: 'error',
        timeout: 6000
      });
    }
  });
  const heroCta = document.getElementById('hero-cta');
  if (heroCta) {
    heroCta.addEventListener('click', (ev) => {
      ev.preventDefault();
      // Open a new blank contact page in a new tab/window
      try {
        window.open('contact.html', '_blank');
      } catch (err) {
        // Fallback: navigate in the same tab
        window.location.href = 'contact.html';
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
