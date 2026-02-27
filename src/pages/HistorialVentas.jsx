import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function HistorialVentas() {
    const [ventas, setVentas] = useState([]);
    const [filaExpandida, setFilaExpandida] = useState(null);

    useEffect(() => {
        const cargarVentas = async () => {
            try {
                const respuesta = await api.get('/ventas');
                setVentas(respuesta.data);
            } catch (error) {
                console.error('Error al cargar historial:', error);
            }
        };
        cargarVentas();
    }, []);

    const toggleFila = (id) => {
        if (filaExpandida === id) {
            setFilaExpandida(null); 
        } else {
            setFilaExpandida(id); 
        }
    };
    const descargarImagen = async (url, idVenta) => {
        try {
            // Obtenemos la imagen desde Cloudinary
            const response = await fetch(url);
            const blob = await response.blob();
            
            // Creamos un enlace temporal en el navegador para forzar la descarga
            const urlBlob = window.URL.createObjectURL(blob);
            const enlace = document.createElement('a');
            enlace.href = urlBlob;
            enlace.download = `comprobante_venta_${idVenta}.jpg`; // Nombre del archivo que se descargará
            
            // Simulamos el clic y limpiamos
            document.body.appendChild(enlace);
            enlace.click();
            document.body.removeChild(enlace);
            window.URL.revokeObjectURL(urlBlob);
        } catch (error) {
            console.error('Error al descargar:', error);
            alert('Hubo un problema al intentar descargar la imagen.');
        }
    };

    return (
        <div className="dashboard-container" style={{ display: 'block', maxWidth: '1200px', margin: '40px auto' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Relación de Ventas</h2>
            
            {/* CONTENEDOR RESPONSIVO PARA LA TABLA */}
            <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--primary)', color: 'white', textAlign: 'left' }}>
                            <th style={{ padding: '15px' }}>ID</th>
                            <th style={{ padding: '15px' }}>Vendedor y Detalle</th>
                            <th style={{ padding: '15px' }}>Productos</th>
                            <th style={{ padding: '15px' }}>Total</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ventas.map(venta => (
                            <React.Fragment key={venta.id}>
                                {/* FILA PRINCIPAL */}
                                <tr style={{ borderBottom: filaExpandida === venta.id ? 'none' : '1px solid var(--border-light)', backgroundColor: filaExpandida === venta.id ? '#f8fafc' : 'white' }}>
                                    <td style={{ padding: '15px', fontWeight: '500', verticalAlign: 'top' }}>#{venta.id}</td>
                                    
                                    <td style={{ padding: '15px', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{venta.nombre_vendedor}</div>
                                        <div style={{ fontSize: '13px', textDecoration: 'underline', color: 'var(--text-main)' }}>
                                            {venta.detalle_compra}
                                        </div>
                                    </td>
                                    
                                    <td style={{ padding: '15px', verticalAlign: 'top' }}>
                                        <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                            {venta.productos_vendidos?.map((prod, idx) => (
                                                <li key={idx} style={{ marginBottom: '4px' }}>
                                                    <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{prod.cantidad}x</span> {prod.nombre}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    
                                    <td style={{ padding: '15px', fontWeight: 'bold', color: 'var(--primary)', verticalAlign: 'top' }}>
                                        S/ {venta.total}
                                    </td>
                                    
                                    <td style={{ padding: '15px', textAlign: 'center', verticalAlign: 'top' }}>
                                        <button 
                                            onClick={() => toggleFila(venta.id)}
                                            className="btn"
                                            style={{ padding: '8px 15px', fontSize: '13px', width: 'auto', backgroundColor: filaExpandida === venta.id ? 'var(--text-muted)' : 'var(--primary)', color: 'white' }}
                                        >
                                            {filaExpandida === venta.id ? 'Cerrar Detalle ⬆️' : 'Ver Detalle ⬇️'}
                                        </button>
                                    </td>
                                </tr>

                                {/* FILA DESPLEGABLE (EL DESGLOSE) */}
                                {filaExpandida === venta.id && (
                                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid var(--primary)' }}>
                                        <td colSpan="5" style={{ padding: '20px 40px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', alignItems: 'start' }}>
                                                
                                                {/* Info adicional */}
                                                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                                                    <h4 style={{ margin: '0 0 15px 0', color: 'var(--primary)', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Información de Pago</h4>
                                                    <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Método:</strong> <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{venta.metodo_pago || 'No especificado'}</span></p>
                                                    <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Documento:</strong> {venta.tipo_documento || 'No especificado'}</p>
                                                    <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Celular:</strong> {venta.celular || 'No registrado'}</p>
                                                    <p style={{ margin: '8px 0', fontSize: '14px', color: 'var(--text-muted)' }}><strong>Fecha:</strong> {new Date(venta.fecha_hora).toLocaleString()}</p>
                                                </div>

                                                {/* Imagen */}
<div style={{ textAlign: 'center' }}>
    <img 
        src={venta.url_captura} 
        alt="Comprobante" 
        style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '15px' }} 
    />
    <br />
    <button 
        onClick={() => descargarImagen(venta.url_captura, venta.id)}
        className="btn"
        style={{ padding: '8px 15px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
    >
        ⬇️ Descargar Captura
    </button>
</div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        {ventas.length === 0 && (
                            <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center' }}>Aún no hay ventas registradas.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}