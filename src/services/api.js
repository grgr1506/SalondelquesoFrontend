import axios from 'axios';

const api = axios.create({
    // CAMBIA LA IP POR LA QUE ANOTASTE EN EL PASO 1
    baseURL: 'https://salondelquesobackend.onrender.com/api', 
});

// Interceptor para inyectar el token de seguridad automáticamente en cada petición
api.interceptors.request.use((config) => {
    const usuarioString = localStorage.getItem('usuario');
    
    if (usuarioString) {
        const usuario = JSON.parse(usuarioString);
        // Si el usuario tiene un token guardado, lo ponemos en la cabecera
        if (usuario.token) {
            config.headers.Authorization = `Bearer ${usuario.token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
