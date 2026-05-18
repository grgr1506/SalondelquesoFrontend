import axios from 'axios';

const api = axios.create({
    baseURL: 'https://salondelquesobackend.onrender.com/api', 
});

// Interceptor para inyectar el token de seguridad automáticamente en cada petición
api.interceptors.request.use((config) => {
    const usuarioString = localStorage.getItem('usuario');
    
    if (usuarioString) {
        const usuario = JSON.parse(usuarioString);
        if (usuario.token) {
            config.headers.Authorization = `Bearer ${usuario.token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
