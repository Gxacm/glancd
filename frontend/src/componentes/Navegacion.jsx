import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navegacion = () => {
  const navigate = useNavigate();
  const location = useLocation(); // <--- OBTENEMOS LA RUTA ACTUAL
  const [menuAbierto, setMenuAbierto] = useState(false);

  const usuarioGuardado = localStorage.getItem('usuario_glancd');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  const inicial = usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U';

  const manejarCierreSesion = () => {
    localStorage.removeItem('token_glancd');
    localStorage.removeItem('usuario_glancd');
    localStorage.removeItem('userId');
    navigate('/');
  };

  // Función para cambiar el estilo si el enlace coincide con la ruta actual
  const obtenerEstiloEnlace = (ruta) => {
    const esActiva = location.pathname.includes(ruta);
    return {
      ...estilos.navLink,
      color: esActiva ? '#fbf9f1' : '#8f9b95',
      borderBottom: esActiva ? '2px solid #e07a5f' : '2px solid transparent',
      paddingBottom: '4px'
    };
  };

  return (
    <header style={estilos.header}>
      <div style={estilos.logoContainer}>
        <Link to="/dashboard" style={estilos.logo}>
          glancd<span style={estilos.punto}>.</span>
        </Link>
      </div>

      <nav style={estilos.nav}>
        {/* APLICAMOS EL ESTILO DINÁMICO */}
        <Link to="/explorar" style={obtenerEstiloEnlace('/explorar')}>Explorar</Link>
        <Link to="/biblioteca" style={obtenerEstiloEnlace('/biblioteca')}>Mi biblioteca</Link>
        <Link to="/resenas" style={obtenerEstiloEnlace('/resenas')}>Reseñas</Link>
      </nav>

      <div style={estilos.perfilContainer}>
        <button 
          style={estilos.avatarBtn} 
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          {inicial}
        </button>

        {menuAbierto && (
          <div style={estilos.menuFlotante}>
            <div style={estilos.menuHeader}>
              <p style={estilos.nombreUsuario}>{usuario?.nombre || 'Usuario'}</p>
              <p style={estilos.correoUsuario}>{usuario?.correo || ''}</p>
            </div>
            <button style={estilos.botonCerrarSesion} onClick={manejarCierreSesion}>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

const estilos = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', backgroundColor: '#0f1e19', borderBottom: '1px solid rgba(251, 249, 241, 0.05)', position: 'relative' },
  logoContainer: { flex: 1 },
  logo: { fontFamily: '"Georgia", serif', fontSize: '1.8rem', fontWeight: 'bold', color: '#fbf9f1', textDecoration: 'none', letterSpacing: '-0.5px' },
  punto: { color: '#e07a5f' },
  nav: { display: 'flex', gap: '32px', flex: 1, justifyContent: 'center' },
  navLink: { textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500', transition: 'all 0.2s ease' },
  perfilContainer: { flex: 1, display: 'flex', justifyContent: 'flex-end', position: 'relative' },
  avatarBtn: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'transparent', border: '1px solid #e07a5f', color: '#e07a5f', fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  menuFlotante: { position: 'absolute', top: '55px', right: '0', backgroundColor: '#162c25', border: '1px solid rgba(251, 249, 241, 0.1)', borderRadius: '8px', padding: '8px 0', minWidth: '200px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', flexDirection: 'column' },
  menuHeader: { padding: '12px 16px', borderBottom: '1px solid rgba(251, 249, 241, 0.05)', marginBottom: '8px' },
  nombreUsuario: { margin: 0, color: '#fbf9f1', fontWeight: 'bold', fontSize: '0.9rem' },
  correoUsuario: { margin: 0, color: '#8f9b95', fontSize: '0.8rem', marginTop: '4px' },
  botonCerrarSesion: { backgroundColor: 'transparent', border: 'none', color: '#e07a5f', padding: '12px 16px', textAlign: 'left', fontSize: '0.9rem', cursor: 'pointer', width: '100%' }
};

export default Navegacion;