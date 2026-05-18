import React, { useState, useEffect } from 'react';
import api from '../services/api';
import * as XLSX from 'xlsx';

export default function HistorialVentas() {
    const [ventas, setVentas] = useState([]);
    const [filaExpandida, setFilaExpandida] = useState(null);
    const [filtroVendedor, setFiltroVendedor] = useState(''); // Estado para el buscador

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

    // FUNCION DE ELIMINAR VENTA
    const manejarEliminar = async (idVenta) => {
        if (window.confirm('⚠️ ¿Estás seguro de ANULAR esta venta?\n\nLos productos vendidos regresarán al inventario automáticamente.')) {
            try {
                await api.delete(`/ventas/${idVenta}`);
                // Actualizamos la tabla borrando esa venta sin recargar la página
                setVentas(ventas.filter(v => v.id !== idVenta));
                alert('✅ Venta anulada exitosamente. Stock actualizado.');
            } catch (error) {
                alert('Error al anular la venta.');
            }
        }
    };

    const descargarImagen = async (url, sufijoNombre) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const urlBlob = window.URL.createObjectURL(blob);
            const enlace = document.createElement('a');
            enlace.href = urlBlob;
            enlace.download = `comprobante_${sufijoNombre}.jpg`;
            document.body.appendChild(enlace);
            enlace.click();
            document.body.removeChild(enlace);
            window.URL.revokeObjectURL(urlBlob);
        } catch (error) {
            alert('Hubo un problema al intentar descargar la imagen.');
        }
    };

    const exportarExcel = () => {
        if (ventasFiltradas.length === 0) return alert('No hay ventas para exportar.');
        const datosParaExcel = ventasFiltradas.map(v => {
            const textoProductos = v.productos_vendidos 
                ? v.productos_vendidos.map(p => `${p.cantidad}x ${p.nombre}`).join(', ') 
                : 'Sin detalles';
            return {
                'ID Venta': v.id,
                'Fecha y Hora': new Date(v.fecha_hora).toLocaleString(),
                'Vendedor': v.nombre_vendedor,
                'Celular Cliente': v.celular || '-',
                'Método de Pago': v.metodo_pago || '-',
                'Total (S/)': v.total,
                'Productos': textoProductos
            };
        });
        const hoja = XLSX.utils.json_to_sheet(datosParaExcel);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Reporte Filtrado");
        XLSX.writeFile(libro, `Reporte_Ventas_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    // FILTRAMOS LAS VENTAS EN BASE AL BUSCADOR
    const ventasFiltradas = ventas.filter(v => 
        v.nombre_vendedor.toLowerCase().includes(filtroVendedor.toLowerCase())
    );

    return (
        <div className="dashboard-container" style={{ display: 'block', maxWidth: '1200px', margin: '40px auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{ color: 'var(--primary)', margin: 0 }}>Historial de Operaciones</h2>
                <button onClick={exportarExcel} className="btn" style={{ backgroundColor: '#059669', color: 'white', fontWeight: '600' }}>
                    📊 Exportar a Excel
                </button>
            </div>

            {/* BARRA DE FILTRO POR VENDEDOR */}
            <div style={{ marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="🔍 Buscar por nombre del vendedor..." 
                    className="input-control" 
                    value={filtroVendedor}
                    onChange={(e) => setFiltroVendedor(e.target.value)}
                    style={{ maxWidth: '400px' }}
                />
            </div>

            <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--primary)', color: 'white', textAlign: 'left' }}>
                            <th style={{ padding: '15px' }}>ID</th>
                            <th style={{ padding: '15px' }}>Vendedor</th>
                            <th style={{ padding: '15px' }}>Productos</th>
                            <th style={{ padding: '15px' }}>Total</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ventasFiltradas.map(venta => (
                            <React.Fragment key={venta.id}>
                                <tr style={{ borderBottom: filaExpandida === venta.id ? 'none' : '1px solid var(--border-light)' }}>
                                    <td style={{ padding: '15px', fontWeight: '500' }}>#{venta.id}</td>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{venta.nombre_vendedor}</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(venta.fecha_hora).toLocaleDateString()}</div>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                            {venta.productos_vendidos?.map((prod, idx) => (
                                                <li key={idx}><span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{prod.cantidad}x</span> {prod.nombre}</li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td style={{ padding: '15px', fontWeight: 'bold', color: 'var(--primary)' }}>
                                        S/ {venta.total}
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                            <button onClick={() => toggleFila(venta.id)} className="btn" style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: filaExpandida === venta.id ? 'var(--text-muted)' : 'var(--primary)', color: 'white' }}>
                                                {filaExpandida === venta.id ? 'Cerrar ⬆️' : 'Ver Detalles ⬇️'}
                                            </button>
                                            
                                            {/* BOTÓN DE ELIMINAR */}
                                            <button onClick={() => manejarEliminar(venta.id)} className="btn" style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#ef4444', color: 'white', width: '100%' }}>
                                                🗑️ Anular
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                {filaExpandida === venta.id && (
                                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid var(--primary)' }}>
                                        <td colSpan="5" style={{ padding: '20px 40px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', alignItems: 'start' }}>
                                                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                                                    <h4 style={{ margin: '0 0 15px 0', color: 'var(--primary)', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Información</h4>
                                                    <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Método:</strong> {venta.metodo_pago}</p>
                                                    <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Documento:</strong> {venta.tipo_documento}</p>
                                                    <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Ubicación/Detalle:</strong> {venta.detalle_compra}</p>
                                                </div>

                                                {/* MOSTRAR HASTA 2 IMÁGENES */}
                                                <div style={{ textAlign: 'center' }}>
                                                    {venta.url_captura && venta.url_captura.split(',').map((url, idx) => (
                                                        <div key={idx} style={{ marginBottom: '15px' }}>
                                                            <img src={url} alt={`Comprobante ${idx + 1}`} style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '10px' }} />
                                                            <br />
                                                            <button onClick={() => descargarImagen(url, `${venta.id}_p${idx+1}`)} className="btn" style={{ padding: '8px 15px', backgroundColor: 'var(--primary)', color: 'white', fontSize: '12px' }}>
                                                                ⬇️ Descargar Foto {idx + 1}
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {!venta.url_captura && <p style={{ color: 'var(--text-muted)' }}>Sin imágenes adjuntas.</p>}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
