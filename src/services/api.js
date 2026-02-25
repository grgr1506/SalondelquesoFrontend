import axios from 'axios';

// Cuando subas el backend a Render, cambiarás esta URL por la de producción
const api = axios.create({
    baseURL: 'http://localhost:3000/api', 
});

export default api;