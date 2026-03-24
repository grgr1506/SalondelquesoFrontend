import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminStock() {
    const [productos, setProductos] = useState([]);
    const [autenticado, setAutenticado] = useState(false);
    const [password, setPassword] = useState('');

    const cargarProductos = async () => {
        try {
            const respuesta = await api.get('/productos');
            setProductos(respuesta.data);
        } catch (error) {
            console.error('Error al cargar productos', error);
        }
    };

    useEffect(() => {
        if (autenticado) {
            cargarProductos();
        }
    }, [autenticado]);

    const verificarPassword = (e) => {
        e.preventDefault();
        if (password === 'admin123') {
            setAutenticado(true);
        } else {
            alert('❌ Contraseña incorrecta. Acceso denegado.');
            setPassword('');
        }
    };

    const agregarStock = async (id, nombre, stockActual) => {
        const cantidadStr = prompt(`¿Cuántas unidades nuevas vas a AGREGAR de "${nombre}"?\nStock actual: ${stockActual}`);
        if (!cantidadStr) return; 

        const cantidadAgregar = parseInt(cantidadStr);
        if (isNaN(cantidadAgregar) || cantidadAgregar <= 0) {
            return alert('Por favor ingresa una cantidad válida mayor a cero.');
        }

        const nuevoStock = stockActual + cantidadAgregar;

        try {
            await api.put(`/productos/${id}/stock`, { nuevoStock });
            alert(`¡Se agregaron ${cantidadAgregar} unidades con éxito! Nuevo stock: ${nuevoStock}`);
            cargarProductos(); 
        } catch (error) {
            alert('Error al actualizar el stock.');
        }
    };

    // PANTALLA 1: PEDIR CONTRASEÑA
    if (!autenticado) {
        return (
            <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div style={{ background: 'white', padding: '40px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', textAlign: 'center', maxWidth: '400px', width: '90%', borderTop: '5px solid var(--primary)' }}>
                    <h2 style={{ color: 'var(--primary)', margin: '0 0 10px 0' }}>Acceso Restringido</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Ingrese la contraseña de almacén.</p>
                    <form onSubmit={verificarPassword}>
                        <input 
                            type="password" 
                            className="input-control" 
                            placeholder="Contraseña..." 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                            style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '2px' }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '20px', width: '100%' }}>
                            Ingresar al Sistema
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // PANTALLA 2: INVENTARIO (Si la clave es correcta)
    return (
        <div className="dashboard-container" style={{ display: 'block', maxWidth: '1000px', margin: '40px auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ color: 'var(--primary)', margin: 0 }}>Control de Almacén</h2>
                <button onClick={() => setAutenticado(false)} className="btn" style={{ background: '#e2e8f0', color: '#475569', padding: '8px 15px' }}>🔒 Cerrar Sesión</button>
            </div>
            
            <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--primary)', color: 'white', textAlign: 'left' }}>
                            <th style={{ padding: '15px' }}>Producto</th>
                            <th style={{ padding: '15px' }}>Categoría</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>Stock</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.map(prod => (
                            <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'white' }}>
                                <td style={{ padding: '15px', fontWeight: '500' }}>{prod.nombre}</td>
                                <td style={{ padding: '15px', color: 'var(--text-muted)' }}>{prod.detalle}</td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
    {/* Número del stock */}
    <div style={{ fontWeight: 'bold', fontSize: '18px', color: prod.stock <= 5 ? 'red' : 'var(--text-main)' }}>
        {prod.stock}
    </div>
    
    {/* Etiqueta para Bajo Stock (1 a 5 unidades) */}
    {prod.stock <= 5 && prod.stock > 0 && (
        <div style={{ fontSize: '12px', color: 'red', fontWeight: 'bold', marginTop: '4px' }}>
            ¡Bajo Stock!
        </div>
    )}
    
    {/* Etiqueta para Agotado (0 unidades) */}
    {prod.stock === 0 && (
        <div style={{ fontSize: '12px', color: 'red', fontWeight: 'bold', marginTop: '4px' }}>
            ¡Agotado!
        </div>
    )}
</td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    <button 
                                        onClick={() => agregarStock(prod.id, prod.nombre, prod.stock)}
                                        className="btn btn-primary"
                                        style={{ width: 'auto', padding: '8px 15px', fontSize: '14px', whiteSpace: 'nowrap' }}
                                    >
                                        + Agregar Stock
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}