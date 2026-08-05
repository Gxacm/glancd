import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', email: '', contrasena: '', fecha_nacimiento: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Apuntamos a tus rutas exactas de ms-usuarios
    const url = isRegistering 
      ? 'http://localhost:3001/api/usuarios/registrar'
      : 'http://localhost:3001/api/usuarios/login';

    try {
      const res = await axios.post(url, formData);

      if (isRegistering) {
        // Registro exitoso: Guardar ID y mandar al onboarding
        localStorage.setItem('userId', res.data.usuario.id);
        navigate('/onboarding');
      } else {
        // Login exitoso: Guardar token y mandar al inicio
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', res.data.usuario.id);
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error de conexión con el servidor.');
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>{isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setIsRegistering(false)} disabled={!isRegistering}>Ingresar</button>
        <button onClick={() => setIsRegistering(true)} disabled={isRegistering}>Registrarse</button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {isRegistering && (
          <>
            <input name="nombre" placeholder="Nombre" onChange={handleChange} required />
            <input name="apellido" placeholder="Apellido" onChange={handleChange} required />
            <input name="fecha_nacimiento" type="date" onChange={handleChange} required />
          </>
        )}
        <input name="email" type="email" placeholder="Correo Electrónico" onChange={handleChange} required />
        <input name="contrasena" type="password" placeholder="Contraseña" onChange={handleChange} required />

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">{isRegistering ? 'Registrarme' : 'Entrar'}</button>
      </form>
    </div>
  );
}