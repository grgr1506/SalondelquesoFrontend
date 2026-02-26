import axios from 'axios';

const api = axios.create({
    // CAMBIA LA IP POR LA QUE ANOTASTE EN EL PASO 1
    baseURL: 'http://192.168.100.128:3000/api', 
});

export default api;