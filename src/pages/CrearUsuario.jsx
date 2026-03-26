import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Usamos tu conexión a Render

const CrearUsuario = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('vendedor');
    const [mensaje, setMensaje] = useState('');
    const [usuarios, setUsuarios] = useState([]);

    const token = localStorage.getItem('token');
    
    // Configuramos la llave de seguridad para enviarla al backend
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const cargarUsuarios = async () => {
        try {
            console.log("Intentando obtener usuarios...");
            const res = await api.get('/usuarios', config);
            console.log("¡Éxito! El backend respondió con:", res.data);
            setUsuarios(res.data);
        } catch (error) {
            console.error("Falló la carga de usuarios.");
            console.error("Detalle del error:", error.response?.data || error.message);
            console.error("Código de estado:", error.response?.status);
            alert("No se pudieron cargar los usuarios. Revisa la consola."); // Aviso visual
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const handleCrear = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/usuarios/crear', { username, password, rol }, config);
            setMensaje('✅ ' + res.data.mensaje);
            setUsername(''); 
            setPassword('');
            cargarUsuarios(); // Recargamos la tabla automáticamente
        } catch (error) {
            setMensaje('❌ ' + (error.response?.data?.mensaje || 'Error de conexión'));
        }
    };

    const cambiarRol = async (id, nuevoRol) => {
        try {
            await api.put(`/usuarios/${id}/rol`, { rol: nuevoRol }, config);
            cargarUsuarios();
            alert('Rol actualizado correctamente en el sistema');
        } catch (error) {
            alert('Error al actualizar rol');
        }
    };

    return (
        /* Usamos tu grid responsivo. En PC: Tabla (2fr) a la izq, Formulario (1fr) a la der */
        <div className="dashboard-container" style={{ alignItems: 'start' }}>
            
            {/* LADO IZQUIERDO: TABLA DE USUARIOS */}
            <div className="card">
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
                                <th style={{ padding: '15px', borderRadius: '8px 0 0 0' }}>Nombre de Usuario</th>
                                <th style={{ padding: '15px', borderRadius: '0 8px 0 0' }}>Nivel de Acceso (Rol)</th>
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
                                            style={{ padding: '8px 12px', backgroundColor: '#f8fafc', cursor: 'pointer', fontWeight: '500' }}
                                        >
                                            <option value="vendedor">Vendedor (Ventas)</option>
                                            <option value="oficina">Oficina (Historial)</option>
                                            <option value="admin">Administrador (Stock)</option>
                                            <option value="superadmin">Superadmin (Total)</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {usuarios.length === 0 && (
                                <tr>
                                    <td colSpan="2" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        Cargando usuarios...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* LADO DERECHO: FORMULARIO DE REGISTRO */}
            <div className="card">
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
                            <option value="vendedor">Vendedor</option>
                            <option value="oficina">Oficina</option>
                            <option value="admin">Administrador</option>
                            <option value="superadmin">Superadmin</option>
                        </select>
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', padding: '14px' }}>
                        + Registrar Empleado
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