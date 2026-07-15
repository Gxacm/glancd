// frontend/src/vistas/Login.jsx
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const manejarLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeExito('');

    try {
      // Consumimos la URL guardada en el .env del frontend
      const url = import.meta.env.VITE_API_USUARIOS + '/login';
      
      const respuesta = await axios.post(url, {
        email: email,
        contrasena: contrasena
      });

      // Guardamos el token JWT en el navegador
      localStorage.setItem('token_glancd', respuesta.data.token);
      
      // === AQUÍ APLICAMOS EL NUEVO CÓDIGO QUE REEMPLAZA AL CONSOLE.LOG ===
      localStorage.setItem('usuario_glancd', JSON.stringify(respuesta.data.usuario));

      setMensajeExito(`¡Bienvenido/a, ${respuesta.data.usuario.nombre}! Login correcto.`);

      // Redirigir al Dashboard de forma automática después de 1.5 segundos para que vean el mensaje de éxito
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      // ===================================================================

    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.mensaje);
      } else {
        setError('No se pudo conectar con el servidor de autenticación.');
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Iniciar Sesión - GLANCD</h2>
      
      {error && <p style={{ color: 'red' }}>⚠️ {error}</p>}
      {mensajeExito && <p style={{ color: 'green' }}>✅ {mensajeExito}</p>}

      <form onSubmit={manejarLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Correo Electrónico:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña:</label>
          <input 
            type="password" 
            value={contrasena} 
            onChange={(e) => setContrasena(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Ingresar al Sistema
        </button>
      </form>
    </div>
  );
};

export default Login;