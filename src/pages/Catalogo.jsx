import { useState, useEffect } from 'react';
import api from '../services/api';
import CheckoutModal from '../components/CheckoutModal';

export default function Catalogo() {
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        cargarProductos();
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

        if (isNaN(cantidad) || cantidad <= 0) return;

        if (cantidad > producto.stock) {
            return alert(`Solo quedan ${producto.stock} unidades disponibles de ${producto.nombre}.`);
        }

        setCarrito(carritoActual => {
            const existe = carritoActual.find(item => item.id === producto.id);
            if (existe) {
                const nuevaCantidad = existe.cantidad + cantidad;
                if (nuevaCantidad > producto.stock) {
                    alert('No puedes agregar más, supera el stock disponible.');
                    return carritoActual;
                }
                return carritoActual.map(item => 
                    item.id === producto.id ? { ...item, cantidad: nuevaCantidad } : item
                );
            }
            return [...carritoActual, { ...producto, cantidad }];
        });

        setProductoSeleccionado(null);
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
        <div className="dashboard-container">
            {/* ZONA IZQUIERDA: LISTA DE PRODUCTOS */}
            <div>
                <h2 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Lista de Precios</h2>
                <input 
                    type="text" 
                    placeholder="🔍 Buscar producto por nombre o categoría..." 
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
                                <div style={{ fontWeight: 'bold', color: prod.stock > 0 ? 'var(--text-main)' : 'var(--accent)' }}>
                                    {prod.stock}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', width: '120px', fontWeight: '700', fontSize: '18px', color: 'var(--primary)' }}>
                                {obtenerMoneda(prod.detalle)} {prod.precio}
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
                <h2 style={{ marginTop: 0, borderBottom: '2px solid var(--border-light)', paddingBottom: '15px', color: 'var(--primary)' }}>
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
                                        <div style={{ fontWeight: '600', fontSize: '15px' }}>{item.nombre}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                                            {item.cantidad} x {obtenerMoneda(item.detalle)} {item.precio}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <span style={{ fontWeight: '700', color: 'var(--primary)' }}>
                                            {obtenerMoneda(item.detalle)} {(item.precio * item.cantidad).toFixed(2)}
                                        </span>
                                        <button 
                                            onClick={() => eliminarDelCarrito(item.id)} 
                                            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '26px', lineHeight: '1', padding: '0 5px' }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '2px dashed var(--border-light)' }}>
                            {calcularTotalSoles() > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>
                                    <span>Total Soles:</span>
                                    <span>S/ {calcularTotalSoles().toFixed(2)}</span>
                                </div>
                            )}
                            {calcularTotalDolares() > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>
                                    <span>Total Dólares:</span>
                                    <span>$ {calcularTotalDolares().toFixed(2)}</span>
                                </div>
                            )}
                            <button className="btn btn-success" onClick={() => setIsCheckoutOpen(true)}>
                                Procesar Venta
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* POPUP PARA AGREGAR PRODUCTO */}
            {productoSeleccionado && (
                <div className="modal-overlay" onClick={() => setProductoSeleccionado(null)} style={{ zIndex: 1000 }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center', padding: '30px' }}>
                        <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-main)' }}>Agregar Producto</h3>
                        <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--primary)', marginBottom: '5px' }}>{productoSeleccionado.nombre}</p>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>Stock disponible: {productoSeleccionado.stock}</p>
                        
                        <form onSubmit={confirmarAgregarAlCarrito}>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: 'var(--text-main)' }}>Cantidad a vender:</label>
                                <input 
                                    type="number" 
                                    name="cantidad" 
                                    min="1" 
                                    max={productoSeleccionado.stock} 
                                    defaultValue="1" 
                                    className="input-control"
                                    style={{ textAlign: 'center', fontSize: '24px', padding: '15px', fontWeight: 'bold' }}
                                    autoFocus
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginBottom: '10px', fontSize: '16px', padding: '14px' }}>
                                Confirmar y Agregar
                            </button>
                            <button type="button" className="btn" onClick={() => setProductoSeleccionado(null)} style={{ width: '100%', background: '#e2e8f0', color: '#475569', fontSize: '16px', padding: '14px' }}>
                                Cancelar
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE CHECKOUT */}
            {isCheckoutOpen && (
                <CheckoutModal 
                    carrito={carrito} 
                    totalSoles={calcularTotalSoles()} 
                    totalDolares={calcularTotalDolares()} 
                    onClose={() => setIsCheckoutOpen(false)} 
                    onVentaExitosa={() => { setCarrito([]); cargarProductos(); }}
                />
            )}
        </div>
    );
}