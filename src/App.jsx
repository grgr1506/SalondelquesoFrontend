import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Catalogo from './pages/Catalogo';
import AdminStock from './pages/AdminStock';
import HistorialVentas from './pages/HistorialVentas';
import logoGLI from './assets/logo gli.jpeg';
import Login from './pages/Login';
import CrearUsuario from './pages/CrearUsuario';
import RutaProtegida from './components/RutaProtegida';

function App() {
    // Leemos quién está conectado desde el almacenamiento del navegador
    const usuarioStr = localStorage.getItem('usuario');
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;

    // Función para salir de la cuenta
    const cerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/login'; // Forzamos recarga hacia el login
    };

    return (
        <Router>
            <div>
                {/* EL MENÚ SOLO SE MUESTRA SI HAY UN USUARIO LOGEADO */}
                {usuario && (
                    <nav className="navbar">
                        <div className="navbar-brand">
                            <img src={logoGLI} alt="Logo GLI" className="logo-img" />
                        </div>
                        <div className="nav-links">
                            
                            {/* Catálogo: Lo ven Vendedores y Superadmin */}
                            {(usuario.rol === 'vendedor' || usuario.rol === 'superadmin') && (
                                <Link to="/" className="nav-link">Catálogo</Link>
                            )}

                            {/* Reposición: Lo ven Administradores y Superadmin */}
                            {(usuario.rol === 'admin' || usuario.rol === 'superadmin') && (
                                <Link to="/reposicion" className="nav-link">Reposición</Link>
                            )}

                            {/* Historial: Lo ven los de Oficina y Superadmin */}
                            {(usuario.rol === 'oficina' || usuario.rol === 'superadmin') && (
                                <Link to="/historial" className="nav-link">Historial</Link>
                            )}

                            {/* Crear Usuarios: EXCLUSIVO del Superadmin */}
                            {usuario.rol === 'superadmin' && (
                                <Link to="/crear-usuario" className="nav-link">Usuarios</Link>
                            )}

                            {/* Botón de Salir para todos */}
                            <button 
                                onClick={cerrarSesion} 
                                className="nav-link" 
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ff4d4d', fontWeight: 'bold' }}
                            >
                                Salir
                            </button>
                        </div>
                    </nav>
                )}

                <Routes>
                    {/* LA ÚNICA RUTA QUE NO TIENE CANDADO */}
                    <Route path="/login" element={<Login />} />

                    {/* TODAS ESTAS RUTAS ESTÁN ENVUELTAS POR EL GUARDIA DE SEGURIDAD */}
                    <Route path="/" element={
                        <RutaProtegida><Catalogo /></RutaProtegida>
                    } />
                    
                    <Route path="/admin" element={
                        <RutaProtegida><AdminStock /></RutaProtegida>
                    } />
                    
                    <Route path="/reposicion" element={
                        <RutaProtegida><AdminStock /></RutaProtegida>
                    } />
                    
                    <Route path="/historial" element={
                        <RutaProtegida><HistorialVentas /></RutaProtegida>
                    } />
                    
                    {/* ESTA RUTA PIDE ESPECÍFICAMENTE SER SUPERADMIN */}
                    <Route path="/crear-usuario" element={
                        <RutaProtegida rolRequerido="superadmin"><CrearUsuario /></RutaProtegida>
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default App;