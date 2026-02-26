import axios from 'axios';

const api = axios.create({
    // CAMBIA LA IP POR LA QUE ANOTASTE EN EL PASO 1
    baseURL: 'https://salondelquesobackend.onrender.com/api', 
});

export default api;