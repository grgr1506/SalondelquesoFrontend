import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminStock() {
    const [productos, setProductos] = useState([]);

    const cargarProductos = async () => {
        try {
            const respuesta = await api.get('/productos');
            setProductos(respuesta.data);
        } catch (error) {
            console.error('Error al cargar productos', error);
        }
    };

    useEffect(() => {
        cargarProductos();
    }, []);

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

    return (
        <div className="dashboard-container" style={{ display: 'block', maxWidth: '1000px', margin: '40px auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ color: 'var(--primary)', margin: 0 }}>Control de Almacén</h2>
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
                                    <div style={{ fontWeight: 'bold', fontSize: '18px', color: prod.stock <= 5 ? 'red' : 'var(--text-main)' }}>
                                        {prod.stock}
                                    </div>
                                    {prod.stock <= 5 && prod.stock > 0 && (
                                        <div style={{ fontSize: '12px', color: 'red', fontWeight: 'bold', marginTop: '4px' }}>
                                            ¡Bajo Stock!
                                        </div>
                                    )}
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