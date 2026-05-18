import { useState, useEffect } from 'react';
import api from '../services/api';

export default function CrearUsuario() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('vendedor');
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(false);

    const cargarUsuarios = async () => {
        try {
            const res = await api.get('/usuarios');
            setUsuarios(res.data);
        } catch (error) {
            console.error('Error al cargar los usuarios:', error);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const manejarRegistro = async (e) => {
        e.preventDefault();
        setCargando(true);
        try {
            await api.post('/usuarios/registrar', { username, password, role });
            alert('✅ Usuario creado exitosamente.');
            setUsername('');
            setPassword('');
            setRole('vendedor');
            cargarUsuarios(); // Recargamos la tabla
        } catch (error) {
            alert(error.response?.data?.mensaje || 'Error al crear usuario.');
        } finally {
            setCargando(false);
        }
    };

    const manejarEliminar = async (id, nombre) => {
        if (nombre === 'admin' || nombre === 'publico') {
            return alert('⚠️ Por seguridad de la aplicación, las cuentas máster (admin/publico) no pueden ser eliminadas.');
        }

        if (window.confirm(`¿Estás completamente seguro de eliminar al usuario "${nombre.toUpperCase()}"?`)) {
            try {
                await api.delete(`/usuarios/${id}`);
                alert('✅ Usuario eliminado con éxito.');
                setUsuarios(usuarios.filter(u => u.id !== id)); // Quitamos de la tabla en vivo
            } catch (error) {
                alert('Error al intentar eliminar el usuario.');
            }
        }
    };

    return (
        <div className="dashboard-container" style={{ display: 'block', maxWidth: '800px', margin: '40px auto' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '25px' }}>Gestión de Personal</h2>

            {/* FORMULARIO DE REGISTRO */}
            <div className="card" style={{ marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>Registrar Nuevo Colaborador</h3>
                <form onSubmit={manejarRegistro} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', alignItems: 'end' }}>
                    <div>
                        <label>Usuario (Nombre):</label>
                        <input type="text" required className="input-control" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ej. gonzalo" />
                    </div>
                    <div>
                        <label>Contraseña:</label>
                        <input type="password" required className="input-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                    </div>
                    <div>
                        <button type="submit" className="btn btn-primary" disabled={cargando} style={{ width: '100%', height: '42px' }}>
                            {cargando ? 'Guardando...' : '➕ Crear Cuenta'}
                        </button>
                    </div>
                </form>
            </div>

            {/* TABLA DE USUARIOS CON ACCIÓN DE ELIMINAR */}
            <h3 style={{ fontSize: '18px', marginBottom: '15px', color: 'var(--text-main)' }}>Usuarios con Acceso</h3>
            <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                            <th style={{ padding: '12px' }}>ID</th>
                            <th style={{ padding: '12px' }}>Nombre de Usuario</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <td style={{ padding: '12px', fontWeight: '500' }}>#{u.id}</td>
                                <td style={{ padding: '12px', fontWeight: '600' }}>{u.username.toUpperCase()}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                    <button 
                                        onClick={() => manejarEliminar(u.id, u.username)}
                                        className="btn"
                                        style={{ backgroundColor: '#ef4444', color: 'white', padding: '6px 12px', fontSize: '12px', width: 'auto' }}
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
