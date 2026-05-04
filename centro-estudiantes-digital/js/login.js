document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginOverlay = document.getElementById('loginOverlay');
  const openBtns = document.querySelectorAll('[data-open-login]');
  const closeBtn = document.querySelector('.login-card__close');
  const errorMessage = document.getElementById('errorMessage');
  const loginCard = document.querySelector('.login-card');

  // Función para abrir el modal
  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      loginOverlay.classList.add('is-open');
      document.body.style.overflow = 'hidden'; // Evita el scroll del fondo
    });
  });

  // Función para cerrar el modal
  const closeLogin = () => {
    loginOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
    errorMessage.classList.remove('is-visible');
    loginForm.reset();
  };

  closeBtn.addEventListener('click', closeLogin);

  // Cerrar al hacer click fuera de la card
  loginOverlay.addEventListener('click', (e) => {
    if (e.target === loginOverlay) closeLogin();
  });

  // Lógica de validación y redirección
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    // Simulación de validación con los datos de prueba del instituto
    if (user === 'santiago' && pass === '1234') {
      loginCard.classList.add('is-success');
      errorMessage.classList.remove('is-visible');

      // Redirigir a alumnos.html tras una breve pausa para mostrar el mensaje de éxito
      setTimeout(() => {
        window.location.href = 'alumnos.html';
      }, 1500);
    } else {
      errorMessage.textContent = 'Usuario o contraseña incorrectos. Por favor, intente de nuevo.';
      errorMessage.classList.add('is-visible');
    }
  });
});