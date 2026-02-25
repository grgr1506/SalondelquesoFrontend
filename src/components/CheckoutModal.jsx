import { useState } from 'react';
import api from '../services/api';

export default function CheckoutModal({ carrito, totalSoles, totalDolares, onClose, onVentaExitosa }) {
    const [vendedor, setVendedor] = useState('');
    const [detalle, setDetalle] = useState('');
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
        formData.append('carrito', JSON.stringify(carrito));
        
        // Sumamos ambos totales para el registro general en la BD (opcional: el backend podría separarlos si se actualiza la BD)
        const totalGeneral = totalSoles + (totalDolares * 3.8); // Asumiendo un tipo de cambio referencial si se guarda en una sola columna, o simplemente mandamos el total en soles referencial.
        formData.append('total', totalGeneral); 
        
        formData.append('captura', archivo);

        try {
            await api.post('/ventas', formData);
            alert('✅ ¡Venta registrada y descontada del stock con éxito!');
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
            <div className="checkout-card">
                
                {/* COLUMNA IZQUIERDA: RESUMEN DE COMPRA */}
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
                        {totalSoles > 0 && (
                            <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '5px' }}>
                                S/ {totalSoles.toFixed(2)}
                            </div>
                        )}
                        {totalDolares > 0 && (
                            <div style={{ fontSize: '28px', fontWeight: '800', color: '#ffd700' }}>
                                $ {totalDolares.toFixed(2)}
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: FORMULARIO */}
                <div className="checkout-formulario">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h2 style={{ margin: 0, color: 'var(--primary)' }}>Completar Venta</h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                    </div>

                    <form onSubmit={manejarEnvio}>
                        <div>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>
                                Nombre del Vendedor:
                            </label>
                            <input 
                                type="text" 
                                required 
                                className="input-control"
                                placeholder="Ej. Juan Pérez"
                                value={vendedor} 
                                onChange={(e) => setVendedor(e.target.value)} 
                            />
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <label style={{ display: 'block', fontWeight: '800', marginBottom: '8px', textDecoration: 'underline', color: 'var(--accent)' }}>
                                Detalle de la Compra (Obligatorio):
                            </label>
                            <textarea 
                                required 
                                className="input-control"
                                placeholder="Ej: Pago realizado por Yape. Entregado en mano."
                                rows="3"
                                value={detalle} 
                                onChange={(e) => setDetalle(e.target.value)} 
                            />
                        </div>

                        <div style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', border: '1px dashed var(--primary)', borderRadius: '8px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: 'var(--primary)' }}>
                                📷 Subir Captura de Pantalla:
                            </label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                required 
                                onChange={(e) => setArchivo(e.target.files[0])}
                                style={{ width: '100%', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ marginTop: '40px', display: 'flex', gap: '15px' }}>
                            <button type="button" onClick={onClose} className="btn" style={{ flex: 1, background: '#e2e8f0', color: '#475569' }}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-success" disabled={cargando} style={{ flex: 2 }}>
                                {cargando ? 'Registrando...' : 'Confirmar y Descontar Stock'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}