const toggleBtn = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

if (toggleBtn && sidebar) {
  toggleBtn.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', event => {
    if (!sidebar.contains(event.target) && !toggleBtn.contains(event.target)) {
      sidebar.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}
