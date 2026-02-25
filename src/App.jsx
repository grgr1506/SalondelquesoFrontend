import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Catalogo from './pages/Catalogo';
import AdminStock from './pages/AdminStock';
import HistorialVentas from './pages/HistorialVentas';

function App() {
    return (
        <Router>
            <div>
                {/* Navbar Moderna */}
                <nav className="navbar">
                    <div className="navbar-brand">
                        GLI SalesSystem
                    </div>
                    <ul className="nav-links">
                        <li><Link to="/">Catálogo</Link></li>
                        <li><Link to="/admin">Reposición</Link></li>
                        <li><Link to="/historial">Historial</Link></li>
                    </ul>
                </nav>

                <Routes>
                    <Route path="/" element={<Catalogo />} />
                    <Route path="/admin" element={<AdminStock />} />
                    <Route path="/historial" element={<HistorialVentas />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;