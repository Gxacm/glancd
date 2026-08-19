// frontend/src/vistas/Onboarding.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const [generos, setGeneros] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Construcción dinámica de la API base usando tu variable VITE_API_USUARIOS
  const apiBase = import.meta.env.VITE_API_USUARIOS
    ? import.meta.env.VITE_API_USUARIOS.replace(/\/usuarios\/?$/, '')
    : 'http://localhost:3001/api';
  const token = localStorage.getItem('token_glancd');

  useEffect(() => {
    axios.get(`${apiBase}/generos`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setGeneros(res.data);
        } else {
          setError('El formato de datos devuelto por el servidor no es un arreglo.');
        }
      })
      .catch((err) => {
        console.error('Error al obtener géneros:', err);
        setError('No fue posible cargar el catálogo de géneros literarios.');
      })
      .finally(() => setCargando(false));
  }, [apiBase]);

  const toggleGenero = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((gId) => gId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const guardarPreferencias = async () => {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      setError('No se identificó la sesión del usuario. Intenta iniciar sesión nuevamente.');
      return;
    }

    setGuardando(true);
    setError('');

    try {
      await axios.post(`${apiBase}/generos/usuario/${userId}`, {
        generos_ids: selectedIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // REDIRECCIÓN DIRECTA A TU VISTA DE DASHBOARD
      navigate('/dashboard');
    } catch (err) {
      console.error('Error guardando preferencias:', err);
      setError(err.response?.data?.mensaje || 'Ocurrió un error al guardar tus gustos literarios.');
      setGuardando(false);
    }
  };

  const minimosAlcanzados = selectedIds.length >= 3;

  return (
    <main style={{ 
      backgroundColor: '#fbf9f1', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '40px 20px',
      fontFamily: '"Georgia", serif',
      boxSizing: 'border-box'
    }}>
      
      <div style={{ maxWidth: '680px', width: '100%', textAlign: 'center' }}>
        
        {/* LOGO */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#1f3d34', margin: 0, fontWeight: '700', letterSpacing: '-0.5px' }}>
            glancd<span style={{ color: '#e07a5f' }}>.</span>
          </h1>
        </div>

        {/* CONTENEDOR PRINCIPAL TIPO TARJETA */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '40px 32px',
          boxShadow: '0 10px 30px rgba(31, 61, 52, 0.05)',
          border: '1px solid #e8e4d9'
        }}>
          
          <p style={{ 
            letterSpacing: '2.5px', 
            fontSize: '0.75rem', 
            textTransform: 'uppercase', 
            color: '#e07a5f', 
            fontWeight: 'bold',
            marginBottom: '8px',
            fontFamily: 'sans-serif'
          }}>
            Paso 1 de 1 • Personalización
          </p>

          <h2 style={{ fontSize: '2.2rem', color: '#1f3d34', margin: '0 0 12px 0', lineHeight: '1.2' }}>
            Diseña tu mapa de lectura.
          </h2>

          <p style={{ 
            color: '#555555', 
            fontFamily: 'sans-serif', 
            fontSize: '1rem', 
            lineHeight: '1.5',
            maxWidth: '500px',
            margin: '0 auto 28px auto'
          }}>
            Selecciona al menos 3 géneros literarios que te apasionen para recomendarte historias a tu medida desde el primer momento.
          </p>

          {/* INDICADOR DE PROGRESO / CONTADOR */}
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            backgroundColor: minimosAlcanzados ? '#eaf4ee' : '#f4ebd0',
            color: minimosAlcanzados ? '#1f3d34' : '#8a6d3b',
            padding: '6px 16px', 
            borderRadius: '20px', 
            fontSize: '0.85rem', 
            fontFamily: 'sans-serif',
            fontWeight: '600',
            marginBottom: '32px',
            transition: 'all 0.3s ease'
          }}>
            <span>{minimosAlcanzados ? '✓' : '•'}</span>
            <span>{selectedIds.length} de 3 seleccionados {minimosAlcanzados && '(¡Listo!)'}</span>
          </div>

          {/* MENSAJE DE CARGA */}
          {cargando && (
            <p style={{ color: '#1f3d34', fontFamily: 'sans-serif', fontStyle: 'italic', margin: '40px 0' }}>
              Descubriendo estanterías de géneros...
            </p>
          )}

          {/* MENSAJE DE ERROR */}
          {error && (
            <div style={{ 
              backgroundColor: '#fbf0ed', 
              color: '#d9534f', 
              border: '1px solid #f5c6cb',
              padding: '14px', 
              borderRadius: '8px', 
              marginBottom: '24px', 
              fontFamily: 'sans-serif',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* GRILLA DE CHIPS DE GÉNEROS */}
          {!cargando && !error && (
            <>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '12px', 
                justifyContent: 'center', 
                marginBottom: '40px' 
              }}>
                {generos.map((g) => {
                  const seleccionado = selectedIds.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleGenero(g.id)}
                      style={{
                        padding: '12px 24px',
                        borderRadius: '30px',
                        border: seleccionado ? '1.5px solid #1f3d34' : '1.5px solid #dcd7c9',
                        backgroundColor: seleccionado ? '#1f3d34' : '#fbf9f1',
                        color: seleccionado ? '#fbf9f1' : '#1f3d34',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontFamily: 'sans-serif',
                        fontWeight: seleccionado ? '600' : '400',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: seleccionado ? 'scale(1.03)' : 'scale(1)',
                        boxShadow: seleccionado ? '0 4px 12px rgba(31, 61, 52, 0.15)' : 'none',
                        outline: 'none'
                      }}
                    >
                      {seleccionado ? '✓ ' : '+ '}{g.nombre}
                    </button>
                  );
                })}
              </div>

              {/* BOTÓN CTA PARA IR AL DASHBOARD */}
              <button
                type="button"
                disabled={!minimosAlcanzados || guardando}
                onClick={guardarPreferencias}
                style={{
                  backgroundColor: minimosAlcanzados ? '#1f3d34' : '#ccc',
                  color: '#ffffff',
                  padding: '16px 36px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: minimosAlcanzados && !guardando ? 'pointer' : 'not-allowed',
                  fontSize: '1rem',
                  fontFamily: 'sans-serif',
                  fontWeight: '600',
                  transition: 'all 0.25s ease',
                  width: '100%',
                  maxWidth: '320px',
                  boxShadow: minimosAlcanzados ? '0 6px 20px rgba(31, 61, 52, 0.2)' : 'none'
                }}
              >
                {guardando ? 'Guardando preferencias...' : 'Entrar a mi Dashboard →'}
              </button>
            </>
          )}

        </div>

        {/* PIE DE PÁGINA ELEGANTE */}
        <p style={{ color: '#888888', fontSize: '0.85rem', marginTop: '24px', fontFamily: 'sans-serif' }}>
          Podrás modificar o agregar más géneros en cualquier momento desde tu perfil.
        </p>

      </div>
    </main>
  );
}
