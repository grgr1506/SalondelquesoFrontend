import React, { useState } from 'react';
import api from '../services/api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Utilizamos tu api centralizada conectada a Render
            const response = await api.post('/usuarios/login', { username, password });
            
            // Axios guarda la respuesta del backend en .data
            const data = response.data;

            // Guardamos el token en el navegador
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            
            // Forzamos la recarga para que aparezca la Navbar ejecutiva
            window.location.href = '/'; 
        } catch (error) {
            setError(error.response?.data?.mensaje || 'Error de conexión con el servidor');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '40px 30px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ color: 'var(--primary)', margin: '0 0 10px 0', fontSize: '26px' }}>Acceso al Sistema</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Ingresa tus credenciales corporativas</p>
                </div>
                
                {error && (
                    <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>USUARIO</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                            className="input-control"
                            placeholder="Tu nombre de usuario"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>CONTRASEÑA</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className="input-control"
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', padding: '15px', fontSize: '16px' }}>
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;