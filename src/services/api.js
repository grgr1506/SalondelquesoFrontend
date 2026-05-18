import axios from 'axios';

const api = axios.create({
    baseURL: 'https://salondelquesobackend.onrender.com/api', 
});

// Interceptor corregido: Busca el token directamente donde tu Login lo guarda
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    
    // Si hay un token guardado, lo inyecta en la cabecera
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
