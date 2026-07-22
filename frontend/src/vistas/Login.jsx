import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const manejarLogin = async (event) => {
    event.preventDefault();
    setError('');
    setMensajeExito('');

    try {
      const respuesta = await axios.post(`${import.meta.env.VITE_API_USUARIOS}/login`, { email, contrasena });
      localStorage.setItem('token_glancd', respuesta.data.token);
      localStorage.setItem('usuario_glancd', JSON.stringify(respuesta.data.usuario));
      setMensajeExito(`Bienvenido/a, ${respuesta.data.usuario.nombre}.`);
      window.setTimeout(() => navigate(respuesta.data.usuario.rol === 'administrador' ? '/dashboard-admin' : '/dashboard'), 700);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No fue posible conectar con el servicio de autenticación.');
    }
  };

  return (
    <main className="login-page">
      <section className="login-story" aria-label="Presentación de Glancd">
        <a className="brand brand-light" href="/">glancd<span>.</span></a>
        <div className="login-story-copy">
          <p className="eyebrow">Tu próxima gran lectura</p>
          <h1>Una biblioteca<br />hecha para sentir.</h1>
          <p>Guarda historias, comparte lo que te dejaron y encuentra tu siguiente libro favorito en un espacio tranquilo.</p>
        </div>
        <div className="quote-card"><span>“</span>Los libros son espejos: solo se ve en ellos lo que uno ya lleva dentro.</div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <a className="brand brand-mobile" href="/">glancd<span>.</span></a>
          <p className="eyebrow">Bienvenido de vuelta</p>
          <h2>Entra a tu rincón de lectura.</h2>
          <p className="form-intro">Tus listas, reseñas y próximos capítulos te están esperando.</p>

          {error && <div className="notice notice-error" role="alert">{error}</div>}
          {mensajeExito && <div className="notice notice-success" role="status">{mensajeExito}</div>}

          <form className="auth-form" onSubmit={manejarLogin}>
            <label>Correo electrónico
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" required />
            </label>
            <label>Contraseña
              <input type="password" value={contrasena} onChange={(event) => setContrasena(event.target.value)} placeholder="Tu contraseña" required />
            </label>
            <button className="button button-primary button-full" type="submit">Continuar a mi biblioteca <span>→</span></button>
          </form>
          <p className="form-footer">Un lugar para leer despacio y recordar siempre.</p>
        </div>
      </section>
    </main>
  );
};

export default Login;
