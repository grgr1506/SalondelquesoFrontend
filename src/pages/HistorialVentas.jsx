import { useState, useEffect } from 'react';
import api from '../services/api';

export default function HistorialVentas() {
    const [ventas, setVentas] = useState([]);
    
    // Nuevo estado para controlar qué imagen se está viendo
    const [imagenSeleccionada, setImagenSeleccionada] = useState(null);

    useEffect(() => {
        const cargarVentas = async () => {
            try {
                const respuesta = await api.get('/ventas');
                setVentas(respuesta.data);
            } catch (error) {
                console.error('Error al cargar el historial:', error);
            }
        };
        cargarVentas();
    }, []);

    return (
        <div className="dashboard-container" style={{ display: 'block', maxWidth: '1100px', margin: '40px auto' }}>
            <h2 style={{ color: 'var(--primary)' }}>Relación de Ventas</h2>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <thead>
                    <tr style={{ backgroundColor: 'var(--primary)', color: 'white', textAlign: 'left' }}>
                        <th style={{ padding: '15px' }}>ID</th>
                        <th style={{ padding: '15px' }}>Vendedor</th>
                        <th style={{ padding: '15px' }}>Detalle de Compra</th>
                        <th style={{ padding: '15px' }}>Total (Referencial)</th>
                        <th style={{ padding: '15px', textAlign: 'center' }}>Comprobante</th>
                    </tr>
                </thead>
                <tbody>
                    {ventas.map(venta => (
                        <tr key={venta.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '15px', fontWeight: '500' }}>#{venta.id}</td>
                            <td style={{ padding: '15px' }}>{venta.nombre_vendedor}</td>
                            
                            {/* Tu requerimiento: Detalle subrayado y resaltado */}
                            <td style={{ padding: '15px', textDecoration: 'underline', fontWeight: 'bold', color: 'var(--text-main)' }}>
                                {venta.detalle_compra}
                            </td>
                            
                            <td style={{ padding: '15px', fontWeight: 'bold', color: 'var(--primary)' }}>
                                S/ {venta.total}
                            </td>
                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                <button 
                                    onClick={() => setImagenSeleccionada(venta.url_captura)}
                                    className="btn btn-primary"
                                    style={{ padding: '8px 15px', fontSize: '13px', width: 'auto' }}
                                >
                                    👁️ Ver Captura
                                </button>
                            </td>
                        </tr>
                    ))}
                    {ventas.length === 0 && (
                        <tr>
                            <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                Aún no hay ventas registradas.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* MODAL DEL VISOR DE IMÁGENES */}
            {imagenSeleccionada && (
                <div className="modal-overlay" onClick={() => setImagenSeleccionada(null)} style={{ zIndex: 9999 }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', padding: '20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, color: 'var(--primary)' }}>Comprobante de Pago</h3>
                            <button onClick={() => setImagenSeleccionada(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                        </div>
                        
                        <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                            <img 
                                src={imagenSeleccionada} 
                                alt="Captura de venta" 
                                style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '4px' }} 
                            />
                        </div>
                        
                        <button className="btn btn-primary" onClick={() => setImagenSeleccionada(null)} style={{ marginTop: '20px', width: '100%' }}>
                            Cerrar Visor
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}