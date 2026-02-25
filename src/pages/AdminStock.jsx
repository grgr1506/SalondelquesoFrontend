import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminStock() {
    const [productos, setProductos] = useState([]);

    const cargarProductos = async () => {
        try {
            const respuesta = await api.get('/productos');
            setProductos(respuesta.data);
        } catch (error) {
            console.error('Error al cargar productos');
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
            <h2 style={{ color: 'var(--primary)' }}>Control de Almacén y Reposición</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <thead>
                    <tr style={{ backgroundColor: 'var(--primary)', color: 'white', textAlign: 'left' }}>
                        <th style={{ padding: '15px' }}>Producto</th>
                        <th style={{ padding: '15px' }}>Categoría / Moneda</th>
                        <th style={{ padding: '15px', textAlign: 'center' }}>Stock Actual</th>
                        <th style={{ padding: '15px', textAlign: 'center' }}>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map(prod => (
                        <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '15px', fontWeight: '500' }}>{prod.nombre}</td>
                            <td style={{ padding: '15px', color: 'var(--text-muted)' }}>{prod.detalle}</td>
                            <td style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px', color: prod.stock > 0 ? 'var(--text-main)' : 'var(--accent)' }}>
                                {prod.stock}
                            </td>
                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                <button 
                                    onClick={() => agregarStock(prod.id, prod.nombre, prod.stock)}
                                    className="btn btn-primary"
                                    style={{ width: 'auto', padding: '8px 15px', fontSize: '14px' }}
                                >
                                    + Agregar Stock
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}