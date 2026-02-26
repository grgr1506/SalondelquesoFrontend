import { useState } from 'react';
import api from '../services/api';

export default function CheckoutModal({ carrito, totalSoles, totalDolares, onClose, onVentaExitosa }) {
    const [vendedor, setVendedor] = useState('');
    const [detalle, setDetalle] = useState('');
    
    // NUEVOS ESTADOS SOLICITADOS POR EL EQUIPO
    const [metodoPago, setMetodoPago] = useState('Yape/Plin');
    const [tipoDocumento, setTipoDocumento] = useState('Boleta');
    const [celular, setCelular] = useState('');
    
    const [archivo, setArchivo] = useState(null);
    const [cargando, setCargando] = useState(false);

    const obtenerMoneda = (detalle) => detalle && detalle.includes('$') ? '$' : 'S/';

    const manejarEnvio = async (e) => {
        e.preventDefault();
        if (!archivo) return alert('Por favor, sube la captura de pantalla del pago.');

        setCargando(true);
        const formData = new FormData();
        formData.append('nombre_vendedor', vendedor);
        formData.append('detalle_compra', detalle);
        
        // AGREGAMOS LOS NUEVOS DATOS AL ENVÍO
        formData.append('metodo_pago', metodoPago);
        formData.append('tipo_documento', tipoDocumento);
        formData.append('celular', celular);
        
        formData.append('carrito', JSON.stringify(carrito));
        
        const totalGeneral = totalSoles + (totalDolares * 3.8); 
        formData.append('total', totalGeneral); 
        formData.append('captura', archivo);

        try {
            await api.post('/ventas', formData);
            alert('✅ ¡Venta registrada exitosamente!');
            onVentaExitosa();
            onClose();
        } catch (error) {
            alert('Error al registrar la venta. ' + (error.response?.data?.mensaje || ''));
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="checkout-overlay">
            <div className="checkout-card" style={{ maxWidth: '1000px' }}>
                
                {/* COLUMNA IZQUIERDA: RESUMEN DE COMPRA (Mismo código anterior) */}
                <div className="checkout-resumen">
                    <h2 style={{ margin: '0 0 20px 0', fontSize: '28px' }}>Resumen de Orden</h2>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', paddingRight: '10px' }}>
                        {carrito.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>
                                <div>
                                    <div style={{ fontWeight: '600' }}>{item.nombre}</div>
                                    <div style={{ fontSize: '13px', opacity: 0.8 }}>Cant: {item.cantidad}</div>
                                </div>
                                <div style={{ fontWeight: 'bold' }}>
                                    {obtenerMoneda(item.detalle)} {(item.precio * item.cantidad).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 'auto', borderTop: '2px solid rgba(255,255,255,0.3)', paddingTop: '20px' }}>
                        <div style={{ fontSize: '16px', opacity: 0.8, marginBottom: '10px' }}>Total a cobrar:</div>
                        {totalSoles > 0 && <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '5px' }}>S/ {totalSoles.toFixed(2)}</div>}
                        {totalDolares > 0 && <div style={{ fontSize: '28px', fontWeight: '800', color: '#ffd700' }}>$ {totalDolares.toFixed(2)}</div>}
                    </div>
                </div>

                {/* COLUMNA DERECHA: FORMULARIO MEJORADO */}
                <div className="checkout-formulario" style={{ overflowY: 'auto', maxHeight: '90vh' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ margin: 0, color: 'var(--primary)' }}>Completar Venta</h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                    </div>

                    <form onSubmit={manejarEnvio}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', fontSize: '14px' }}>Vendedor:</label>
                                <input type="text" required className="input-control" value={vendedor} onChange={(e) => setVendedor(e.target.value)} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', fontSize: '14px' }}>Celular (Cliente):</label>
                                <input type="tel" required className="input-control" value={celular} onChange={(e) => setCelular(e.target.value)} placeholder="Ej. 987654321" />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', fontSize: '14px' }}>Método de Pago:</label>
                                <select className="input-control" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                                    <option value="Yape/Plin">Yape / Plin</option>
                                    <option value="Tarjeta">Tarjeta (POS)</option>
                                    <option value="Efectivo">Efectivo</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', fontSize: '14px' }}>Comprobante:</label>
                                <select className="input-control" value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)}>
                                    <option value="Boleta">Boleta</option>
                                    <option value="Factura">Factura</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginTop: '15px' }}>
                            <label style={{ display: 'block', fontWeight: '800', marginBottom: '5px', textDecoration: 'underline', color: 'var(--accent)' }}>
                                Detalle de la Compra:
                            </label>
                            <textarea required className="input-control" rows="2" value={detalle} onChange={(e) => setDetalle(e.target.value)} />
                        </div>

                        <div style={{ marginTop: '15px', padding: '15px', background: '#f8fafc', border: '1px dashed var(--primary)', borderRadius: '8px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: 'var(--primary)' }}>📷 Subir Captura:</label>
                            <input type="file" accept="image/*" required onChange={(e) => setArchivo(e.target.files[0])} style={{ width: '100%' }} />
                        </div>

                        <div style={{ marginTop: '25px', display: 'flex', gap: '15px' }}>
                            <button type="button" onClick={onClose} className="btn" style={{ flex: 1, background: '#e2e8f0' }}>Cancelar</button>
                            <button type="submit" className="btn btn-success" disabled={cargando} style={{ flex: 2 }}>
                                {cargando ? 'Registrando...' : 'Confirmar Venta'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}