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

      //GUARDAR USUARIO
      localStorage.setItem("usuario", JSON.stringify(usuarioValido));
      
      // 3. Redirección única al panel principal
      window.location.href = '../pages/principal.html';

    } else {
      // Credenciales incorrectas
      errorDiv.textContent = "Usuario o contraseña incorrectos.";
      errorDiv.classList.add('show');
    }
  } catch (error) {
    console.error("Error al cargar los usuarios:", error);
    alert("Ocurrió un error al iniciar sesión. Intentá más tarde.");
    errorDiv.textContent = "Error de conexión. Intentá más tarde.";
    errorDiv.classList.add('show');
  }
});
