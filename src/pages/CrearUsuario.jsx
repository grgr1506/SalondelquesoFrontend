import React, { useState, useEffect } from 'react';
import api from '../services/api'; 

const CrearUsuario = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('vendedor');
    const [mensaje, setMensaje] = useState('');
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(false);

    // Carga inicial de usuarios (Ya no enviamos 'config', api.js pone el token automáticamente)
    const cargarUsuarios = async () => {
        try {
            const res = await api.get('/usuarios');
            setUsuarios(res.data);
        } catch (error) {
            console.error("Falló la carga de usuarios:", error.response?.data || error.message);
            alert("Error al cargar los usuarios. Revisa tu sesión.");
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    // Función para crear un usuario nuevo
    const handleCrear = async (e) => {
        e.preventDefault();
        setCargando(true);
        try {
            const res = await api.post('/usuarios/crear', { username, password, rol });
            setMensaje('✅ ' + res.data.mensaje);
            setUsername(''); 
            setPassword('');
            setRol('vendedor');
            cargarUsuarios(); // Recargamos la tabla automáticamente
        } catch (error) {
            setMensaje('❌ ' + (error.response?.data?.mensaje || 'Error de conexión'));
        } finally {
            setCargando(false);
        }
    };

    // Función para actualizar el rol directamente desde la tabla
    const cambiarRol = async (id, nuevoRol) => {
        try {
            await api.put(`/usuarios/${id}/rol`, { rol: nuevoRol });
            cargarUsuarios();
            alert('✅ Rol actualizado correctamente en el sistema');
        } catch (error) {
            alert('❌ Error al actualizar rol. Verifica que seas SuperAdmin.');
        }
    };

    // Función para eliminar un usuario
    const manejarEliminar = async (id, nombre) => {
        if (nombre === 'admin' || nombre === 'publico' || nombre === 'superadmin') {
            return alert('⚠️ Por seguridad de la aplicación, las cuentas principales no pueden ser eliminadas.');
        }

        if (window.confirm(`¿Estás completamente seguro de eliminar al usuario "${nombre.toUpperCase()}"?`)) {
            try {
                await api.delete(`/usuarios/${id}`);
                alert('✅ Usuario eliminado con éxito.');
                setUsuarios(usuarios.filter(u => u.id !== id)); 
            } catch (error) {
                alert('❌ Error al intentar eliminar el usuario. Verifica tus permisos.');
            }
        }
    };

    return (
        <div className="dashboard-container" style={{ alignItems: 'start', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            
            {/* LADO IZQUIERDO: TABLA DE USUARIOS */}
            <div className="card" style={{ flex: '2', minWidth: '320px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '15px' }}>
                    <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '20px' }}>Usuarios del Sistema</h2>
                    <span style={{ backgroundColor: '#eff6ff', color: 'var(--primary)', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                        Total: {usuarios.length}
                    </span>
                </div>
                
                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--primary)', color: 'white', textAlign: 'left' }}>
                                <th style={{ padding: '15px' }}>Nombre de Usuario</th>
                                <th style={{ padding: '15px' }}>Nivel de Acceso (Rol)</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <td style={{ padding: '15px', fontWeight: '600', color: 'var(--text-main)' }}>
                                        {u.username}
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <select 
                                            value={u.rol} 
                                            onChange={(e) => cambiarRol(u.id, e.target.value)}
                                            className="input-control"
                                            style={{ padding: '8px 12px', backgroundColor: '#f8fafc', cursor: 'pointer', fontWeight: '500', width: 'auto' }}
                                        >
                                            <option value="vendedor">Vendedor (Ventas)</option>
                                            <option value="oficina">Oficina (Historial)</option>
                                            <option value="admin">Administrador (Stock)</option>
                                            <option value="superadmin">Superadmin (Total)</option>
                                            <option value="publico">Público (Tablet Fija)</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
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
                            {usuarios.length === 0 && (
                                <tr>
                                    <td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        Cargando usuarios...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* LADO DERECHO: FORMULARIO DE REGISTRO */}
            <div className="card" style={{ flex: '1', minWidth: '300px' }}>
                <h2 style={{ color: 'var(--primary)', margin: '0 0 20px 0', fontSize: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '15px' }}>
                    Dar de alta usuario
                </h2>
                
                <form onSubmit={handleCrear} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>CREDENCIAL DE ACCESO</label>
                        <input 
                            type="text" 
                            placeholder="Ej: j_perez" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                            className="input-control" 
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>CONTRASEÑA TEMPORAL</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className="input-control" 
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>ROL ASIGNADO</label>
                        <select 
                            value={rol} 
                            onChange={(e) => setRol(e.target.value)} 
                            className="input-control"
                        >
                            <option value="vendedor">Vendedor (Caja)</option>
                            <option value="oficina">Oficina (Reportes)</option>
                            <option value="admin">Administrador (Inventario)</option>
                            <option value="superadmin">Superadmin (Todo)</option>
                            <option value="publico">Cuenta Pública (Menú desplegable)</option>
                        </select>
                    </div>
                    
                    <button type="submit" className="btn btn-primary" disabled={cargando} style={{ marginTop: '10px', padding: '14px' }}>
                        {cargando ? 'Guardando...' : '+ Registrar Empleado'}
                    </button>
                </form>

                {mensaje && (
                    <div style={{ marginTop: '20px', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: '600', backgroundColor: mensaje.includes('✅') ? '#dcfce7' : '#fee2e2', color: mensaje.includes('✅') ? '#166534' : '#991b1b' }}>
                        {mensaje}
                    </div>
                )}
            </div>
            
        </div>
    );
};

export default CrearUsuario;
