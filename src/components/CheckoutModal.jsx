import { useState, useEffect } from 'react';
import api from '../services/api';

export default function CheckoutModal({ carrito, totalSoles, totalDolares, onClose, onVentaExitosa }) {
    const usuarioLogeado = JSON.parse(localStorage.getItem('usuario')) || {};
    const [vendedor, setVendedor] = useState(usuarioLogeado.username || '');
    const [detalle, setDetalle] = useState('');
    const [metodoPago, setMetodoPago] = useState('Yape/Plin');
    const [tipoDocumento, setTipoDocumento] = useState('Boleta');
    const [celular, setCelular] = useState('');
    
    const [archivos, setArchivos] = useState([]); 
    const [listaUsuarios, setListaUsuarios] = useState([]); // Nueva lista para la cuenta pública
    const [cargando, setCargando] = useState(false);

    // Detectamos si es una cuenta pública
    const esCuentaPublica = usuarioLogeado.username === 'publico' || usuarioLogeado.role === 'publico';

    useEffect(() => {
        // Si es cuenta pública, cargamos todos los usuarios para el menú desplegable
        if (esCuentaPublica) {
            const cargarUsuarios = async () => {
                try {
                    const res = await api.get('/usuarios');
                    // Filtramos para que la palabra 'publico' no salga en la lista de vendedores
                    const usuariosFiltrados = res.data.filter(u => u.username !== 'publico');
                    setListaUsuarios(usuariosFiltrados);
                    setVendedor(''); // Forzamos a elegir uno
                } catch (error) {
                    console.error('Error al cargar vendedores para cuenta pública:', error);
                }
            };
            cargarUsuarios();
        }
    }, [esCuentaPublica]);

    const obtenerMoneda = (detalle) => detalle && detalle.includes('$') ? '$' : 'S/';

    const manejarCaptura = (e) => {
        const file = e.target.files[0];
        if (file && archivos.length < 2) {
            setArchivos([...archivos, file]);
        }
    };

    const quitarFoto = (index) => {
        setArchivos(archivos.filter((_, i) => i !== index));
    };

    const manejarEnvio = async (e) => {
        e.preventDefault();
        if (!vendedor) {
            return alert('Por favor, selecciona el nombre del vendedor.');
        }
        if (metodoPago === 'Yape/Plin' && archivos.length === 0) {
            return alert('Por favor, toma al menos una foto del pago.');
        }

        setCargando(true);
        const formData = new FormData();
        formData.append('nombre_vendedor', vendedor);
        formData.append('detalle_compra', detalle);
        formData.append('metodo_pago', metodoPago);
        formData.append('tipo_documento', tipoDocumento);
        formData.append('celular', celular);
        formData.append('carrito', JSON.stringify(carrito));
        
        const totalGeneral = totalSoles + (totalDolares * 3.8); 
        formData.append('total', totalGeneral); 
        
        archivos.forEach((file) => {
            formData.append('capturas', file);
        });

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
                {/* COLUMNA IZQUIERDA: RESUMEN DE COMPRA */}
                <div className="checkout-resumen">
                    <h2 style={{ margin: '0 0 20px 0', fontSize: '28px' }}>Resumen de Orden</h2>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', paddingRight: '10px' }}>
                        {carrito.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>
                                <div>
                                    <div style={{ font(Weight): '600' }}>{item.nombre}</div>
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

                {/* COLUMNA DERECHA: FORMULARIO */}
                <div className="checkout-formulario" style={{ overflowY: 'auto', maxHeight: '90vh' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ margin: 0, color: 'var(--primary)' }}>Completar Venta</h2>
                        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                    </div>

                    <form onSubmit={manejarEnvio}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', fontSize: '14px' }}>Vendedor:</label>
                                {esCuentaPublica ? (
                                    <select 
                                        required
                                        className="input-control" 
                                        value={vendedor} 
                                        onChange={(e) => setVendedor(e.target.value)}
                                        style={{ border: '1px solid var(--primary)', backgroundColor: '#fff' }}
                                    >
                                        <option value="">-- Selecciona tu Nombre --</option>
                                        {listaUsuarios.map(u => (
                                            <option key={u.id} value={u.username}>{u.username.toUpperCase()}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input type="text" value={vendedor} readOnly className="input-control" style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }} />
                                )}
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
                            <label style={{ display: 'block', fontWeight: '800', marginBottom: '5px', textDecoration: 'underline', color: 'var(--accent)' }}>Detail de la Compra:</label>
                            <textarea required className="input-control" rows="2" value={detalle} onChange={(e) => setDetalle(e.target.value)} />
                        </div>

                        {metodoPago === 'Yape/Plin' && (
                            <div style={{ marginTop: '20px', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {archivos.length < 2 && (
                                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '15px', border: '2px dashed var(--primary)', backgroundColor: '#f8fafc', borderRadius: '8px', cursor: 'pointer' }}>
                                        <span style={{ fontSize: '28px', marginBottom: '5px' }}>📷</span>
                                        <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--primary)' }}>
                                            {archivos.length === 0 ? 'Tomar Foto 1' : 'Tomar Foto 2 (Opcional)'}
                                        </span>
                                        <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={manejarCaptura} />
                                    </label>
                                )}

                                {archivos.map((arch, index) => (
                                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', border: '1px solid #10b981', borderRadius: '8px', backgroundColor: '#ecfdf5' }}>
                                        <span style={{ color: '#047857', fontWeight: '600', fontSize: '14px' }}>✅ Foto {index + 1} capturada</span>
                                        <button type="button" onClick={() => quitarFoto(index)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ marginTop: '25px', display: 'flex', gap: '15px' }}>
                            <button type="button" onClick={onClose} className="btn" style={{ flex: 1, background: '#e2e8f0', color: 'var(--text-main)' }}>Cancelar</button>
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
