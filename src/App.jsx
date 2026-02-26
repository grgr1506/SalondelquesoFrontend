import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Catalogo from './pages/Catalogo';
import AdminStock from './pages/AdminStock';
import HistorialVentas from './pages/HistorialVentas';
import logoGLI from './assets/logo gli.jpeg';

function App() {
    return (
        <Router>
            <div>
                {/* Navbar Moderna */}
                <nav className="navbar">
    <div className="navbar-brand">
        <img src={logoGLI} alt="Logo GLI" className="logo-img" />
    </div>
    <div className="nav-links">
        <Link to="/" className="nav-link">Catálogo</Link>
        <Link to="/reposicion" className="nav-link">Reposición</Link>
        <Link to="/historial" className="nav-link">Historial</Link>
    </div>
</nav>

                <Routes>
                    <Route path="/" element={<Catalogo />} />
                    <Route path="/admin" element={<AdminStock />} />
                    <Route path="/historial" element={<HistorialVentas />} />
                    <Route path="/reposicion" element={<AdminStock />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;