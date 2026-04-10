/*=====================LOGIN/LOGOUT_SIMULADO=====================*/


/*=====================LOGIN=====================*/
document.getElementById('loginForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const userIngresado = document.getElementById('username').value.trim();
  const passIngresada = document.getElementById('password').value.trim();
  const errorDiv = document.getElementById('errorMessage');

  try {
    // 1. Simulamos la llamada a la base de datos (API Mock)
    const respuesta = await fetch('../api/usuarios.json');
    const usuarios = await respuesta.json();


    // 2. Buscamos si hay coincidencias
    const usuarioValido = usuarios.find(u => u.usuario === userIngresado && u.password === passIngresada);

    if (usuarioValido) {
      errorDiv.classList.remove('show');
      
      // 3. Redirección basada en el ROL
      switch (usuarioValido.rol) {
        case 'estudiante':
          window.location.href = '../alumnos.html'; // El dashboard que ya armamos
          break;
        case 'docente':
          window.location.href = 'panel-docente.html'; //No lo hice funcionar
          break;
        case 'delegado':
          window.location.href = 'panel-delegado.html'; //No lo hice funcionar
          break;
        case 'administrador':
          window.location.href = 'panel-admin.html'; //No lo hice funcionar
          break;
        default:
          alert('Rol no reconocido');
      }

    } else {
      // Credenciales incorrectas
      errorDiv.textContent = "Usuario o contraseña incorrectos.";
      errorDiv.classList.add('show');
    }
  } catch (error) {
    console.error("Error al cargar los usuarios:", error);
    errorDiv.textContent = "Error de conexión. Intentá más tarde.";
    errorDiv.classList.add('show');
  }
});