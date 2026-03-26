import React from 'react';
import { Navigate } from 'react-router-dom';

const RutaProtegida = ({ children, rolRequerido }) => {
    const token = localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');

    // 1. Si no hay token, lo mandamos a la pantalla de Login inmediatamente
    if (!token || !usuarioStr) {
        return <Navigate to="/login" replace />;
    }

    const usuario = JSON.parse(usuarioStr);

    // 2. Si la ruta pide un rol específico (ej. superadmin) y el usuario no lo tiene, lo regresamos al inicio
    if (rolRequerido && usuario.rol !== rolRequerido) {
        return <Navigate to="/" replace />; 
    }

    // 3. Si tiene pase y tiene el rol correcto, lo dejamos ver la página
    return children;
};

export default RutaProtegida;