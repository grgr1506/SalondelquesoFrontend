import { useState, useEffect } from 'react';
import api from '../services/api';
import CheckoutModal from '../components/CheckoutModal';

export default function Catalogo() {
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState('');

    // SISTEMA DE NOTIFICACIONES PROPIAS
    const [toast, setToast] = useState({ visible: false, mensaje: '', tipo: 'success' });

    const mostrarNotificacion = (mensaje, tipo = 'success') => {
        setToast({ visible: true, mensaje, tipo });
        setTimeout(() => setToast({ visible: false, mensaje: '', tipo: 'success' }), 3000);
    };

    useEffect(() => {
        cargarProductos();
        const intervalo = setInterval(() => {
            cargarProductos();
        }, 5000);
        return () => clearInterval(intervalo);
    }, []);

    const cargarProductos = async () => {
        try {
            const respuesta = await api.get('/productos');
            setProductos(respuesta.data);
        } catch (error) {
            console.error("Error al cargar productos:", error);
        }
    };

    const productosFiltrados = productos.filter(prod => 
        prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
        (prod.detalle && prod.detalle.toLowerCase().includes(busqueda.toLowerCase()))
    );

    const obtenerMoneda = (detalle) => {
        return detalle && detalle.includes('$') ? '$' : 'S/';
    };

    const confirmarAgregarAlCarrito = (e) => {
        e.preventDefault();
        const cantidad = parseInt(e.target.cantidad.value);
        const producto = productoSeleccionado;

        if (isNaN(cantidad) || cantidad <= 0) {
            return mostrarNotificacion('Por favor ingresa una cantidad válida.', 'error');
        }

        if (cantidad > producto.stock) {
            return mostrarNotificacion(`Solo quedan ${producto.stock} unidades disponibles.`, 'error');
        }

        let superoStock = false;

        setCarrito(carritoActual => {
            const existe = carritoActual.find(item => item.id === producto.id);
            if (existe) {
                const nuevaCantidad = existe.cantidad + cantidad;
                if (nuevaCantidad > producto.stock) {
                    superoStock = true;
                    return carritoActual; // No lo actualiza porque no hay stock
                }
                return carritoActual.map(item => 
                    item.id === producto.id ? { ...item, cantidad: nuevaCantidad } : item
                );
            }
            return [...carritoActual, { ...producto, cantidad }];
        });

        if (superoStock) {
            mostrarNotificacion('El carrito superó el stock disponible en almacén.', 'error');
        } else {
            mostrarNotificacion(`✅ ${cantidad}x ${producto.nombre} al carrito.`, 'success');
            setProductoSeleccionado(null); // CIERRA EL POP-UP AUTOMÁTICAMENTE
        }
    };

    const eliminarDelCarrito = (id) => {
        setCarrito(carrito.filter(item => item.id !== id));
    };

    const calcularTotalSoles = () => {
        return carrito
            .filter(item => obtenerMoneda(item.detalle) === 'S/')
            .reduce((total, item) => total + (item.precio * item.cantidad), 0);
    };

    const calcularTotalDolares = () => {
        return carrito
            .filter(item => obtenerMoneda(item.detalle) === '$')
            .reduce((total, item) => total + (item.precio * item.cantidad), 0);
    };

    return (
        <div className="dashboard-container" style={{ position: 'relative' }}>
            
            {/* NOTIFICACIÓN TOAST (Propia del sistema) */}
            {toast.visible && (
                <div style={{
                    position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
                    backgroundColor: toast.tipo === 'error' ? 'var(--accent)' : 'var(--success)',
                    color: 'white', padding: '12px 25px', borderRadius: '8px', zIndex: 99999,
                    boxShadow: 'var(--shadow-lg)', fontWeight: 'bold', fontSize: '15px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    animation: 'fadeIn 0.3s ease-in-out'
                }}>
                    <span>{toast.tipo === 'error' ? '⚠️' : ''}</span>
                    {toast.mensaje}
                </div>
            )}

            {/* ZONA IZQUIERDA: LISTA DE PRODUCTOS */}
            <div>
                <h2 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Lista de Precios</h2>
                <input 
                    type="text" 
                    placeholder="🔍 Buscar producto por nombre o presentación..." 
                    className="buscador-input"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                <div className="lista-productos">
                    {productosFiltrados.map(prod => (
                        <div 
                            key={prod.id} 
                            className={`item-lista ${prod.stock === 0 ? 'agotado' : ''}`}
                            onClick={() => prod.stock > 0 && setProductoSeleccionado(prod)}
                        >
                            <div style={{ flex: '1' }}>
                                <div style={{ fontWeight: '600', fontSize: '16px' }}>{prod.nombre}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                                    {prod.detalle}
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', width: '100px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Stock</span>
                                <div style={{ fontWeight: 'bold', color: prod.stock <= 5 ? 'var(--accent)' : 'var(--text-main)' }}>
                                    {prod.stock}
                                </div>
                                {prod.stock <= 5 && prod.stock > 0 && (
                                    <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 'bold', marginTop: '2px' }}>
                                        ¡Bajo Stock!
                                    </div>
                                )}
                            </div>
                            <div style={{ textAlign: 'right', width: '120px', fontWeight: '700', fontSize: '18px', color: 'var(--primary)' }}>
                                {obtenerMoneda(prod.detalle)} {Number(prod.precio).toFixed(2)}
                            </div>
                        </div>
                    ))}
                    {productosFiltrados.length === 0 && (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No se encontraron productos.</p>
                    )}
                </div>
            </div>

            {/* ZONA DERECHA: CARRITO FLOTANTE */}
            <div className="carrito-sidebar">
                <h2 style={{ marginTop: 0, borderBottom: '2px solid var(--border-light)', paddingBottom: '15px', color: 'var(--primary)', fontSize: '18px' }}>
                    Resumen de Venta
                </h2>
                {carrito.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '40px 0' }}>El carrito está vacío</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ flexGrow: 1, maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
                            {carrito.map(item => (
                                <div key={item.id} className="carrito-item">
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-main)' }}>{item.nombre}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                                            {item.cantidad} x {obtenerMoneda(item.detalle)} {Number(item.precio).toFixed(2)}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <span style={{ fontWeight: '700', color: 'var(--primary)' }}>
                                            {obtenerMoneda(item.detalle)} {(item.precio * item.cantidad).toFixed(2)}
                                        </span>
                                        <button 
                                            onClick={() => eliminarDelCarrito(item.id)} 
                                            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '24px', lineHeight: '1', padding: '0 5px' }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '2px dashed var(--border-light)' }}>
                            {calcularTotalSoles() > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
                                    <span>Total Soles:</span>
                                    <span>S/ {calcularTotalSoles().toFixed(2)}</span>
                                </div>
                            )}
                            {calcularTotalDolares() > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
                                    <span>Total Dólares:</span>
                                    <span style={{ color: '#d97706' }}>$ {calcularTotalDolares().toFixed(2)}</span>
                                </div>
                            )}
                            <button className="btn btn-success" onClick={() => setIsCheckoutOpen(true)}>
                                Procesar Venta
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* POP-UP FLOTANTE PARA INGRESAR CANTIDAD */}
            {productoSeleccionado && (
                <div 
                    onClick={() => setProductoSeleccionado(null)} 
                    style={{ 
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                        backgroundColor: 'rgba(31, 41, 55, 0.75)', zIndex: 1000, 
                        display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
                    }}
                >
                    <div 
                        className="card"
                        onClick={(e) => e.stopPropagation()} 
                        style={{ maxWidth: '380px', width: '100%', textAlign: 'center', padding: '30px', animation: 'fadeIn 0.2s ease' }}
                    >
                        <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', fontSize: '20px' }}>Agregar al Carrito</h3>
                        <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', marginBottom: '5px' }}>{productoSeleccionado.nombre}</p>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>Disponibles en stand: {productoSeleccionado.stock}</p>
                        
                        <form onSubmit={confirmarAgregarAlCarrito}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-main)', fontSize: '14px' }}>
                                    ¿Cuántas unidades?
                                </label>
                                <input 
                                    type="number" 
                                    name="cantidad" 
                                    min="1" 
                                    max={productoSeleccionado.stock} 
                                    defaultValue="1" 
                                    className="input-control"
                                    style={{ textAlign: 'center', fontSize: '22px', padding: '12px', fontWeight: 'bold' }}
                                    autoFocus
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginBottom: '10px', fontSize: '15px', padding: '12px' }}>
                                Confirmar
                            </button>
                            <button type="button" className="btn" onClick={() => setProductoSeleccionado(null)} style={{ width: '100%', background: '#e2e8f0', color: '#475569', fontSize: '15px', padding: '12px' }}>
                                Cancelar
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL FINAL DE COBRO */}
            {isCheckoutOpen && (
                <CheckoutModal 
                    carrito={carrito} 
                    totalSoles={calcularTotalSoles()} 
                    totalDolares={calcularTotalDolares()} 
                    onClose={() => setIsCheckoutOpen(false)} 
                    onVentaExitosa={() => { 
                        setCarrito([]); 
                        cargarProductos();
                        mostrarNotificacion('¡La venta ha sido registrada con éxito!', 'success');
                    }}
                />
            )}
        </div>
    );
}
