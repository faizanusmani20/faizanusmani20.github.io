
fetch('common.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('site-header').outerHTML = html;
    initHeader();
  })
  .catch(() => {
    console.warn('common.html could not be loaded — are you opening this file directly? Use a local server instead.');
  });

function initHeader() {
  // Highlight the current page's nav link
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.topnav a[data-page]').forEach(a => {
    if (a.getAttribute('data-page') === page) a.classList.add('active');
  });

  // Mobile hamburger toggle
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('nav.topnav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Close menu after tapping a link (mobile)
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}
