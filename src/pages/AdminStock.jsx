import React, { useState, useEffect } from 'react';
import api from '../services/api';
import * as XLSX from 'xlsx';

export default function AdminStock() {
    const [productos, setProductos] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [pestanaActiva, setPestanaActiva] = useState('inventario'); 

    // Formularios
    const [nuevoProd, setNuevoProd] = useState({ id: '', nombre: '', detalle: '', stock: 0, precio: '', moneda: 'S/.' });
    const [ajuste, setAjuste] = useState({ productoId: '', tipo: 'INGRESO', cantidad: '', nota: '' });
    
    // Buscador amigable para el selector de Ajuste de Stock
    const [busquedaAjuste, setBusquedaAjuste] = useState('');

    // SISTEMA DE NOTIFICACIONES PROPIAS (Reemplaza al alert nativo)
    const [toast, setToast] = useState({ visible: false, mensaje: '', tipo: 'success' });

    const mostrarNotificacion = (mensaje, tipo = 'success') => {
        setToast({ visible: true, mensaje, tipo });
        setTimeout(() => setToast({ visible: false, mensaje: '', tipo: 'success' }), 4000);
    };

    const cargarDatos = async () => {
        try {
            const resProds = await api.get('/productos');
            setProductos(resProds.data);
            const resHist = await api.get('/reposiciones');
            setHistorial(resHist.data);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const limpiarMonedaYDetalle = (detalleStr) => {
        if (!detalleStr) return { presentacion: '-', moneda: 'S/.' };
        const tieneDolar = detalleStr.includes('($)');
        let presentacion = detalleStr.replace('(S/.)', '').replace('($)', '').trim();
        return { presentacion: presentacion || '-', moneda: tieneDolar ? '$' : 'S/.' };
    };

    const registrarProducto = async (e) => {
        e.preventDefault();
        if(!nuevoProd.nombre || !nuevoProd.precio) {
            return mostrarNotificacion('El nombre y el precio son obligatorios.', 'error');
        }
        try {
            await api.post('/productos', nuevoProd);
            mostrarNotificacion('¡Producto registrado con éxito en el catálogo!');
            setNuevoProd({ id: '', nombre: '', detalle: '', stock: 0, precio: '', moneda: 'S/.' });
            cargarDatos();
        } catch (error) {
            mostrarNotificacion('Ocurrió un error al registrar el producto.', 'error');
        }
    };

    const procesarAjusteStock = async (e) => {
        e.preventDefault();
        if(!ajuste.productoId || !ajuste.cantidad || !ajuste.nota) {
            return mostrarNotificacion('Completa todos los campos para el ajuste.', 'error');
        }
        
        const prodSeleccionado = productos.find(p => p.id === parseInt(ajuste.productoId));
        if(!prodSeleccionado) return;

        const infoMoneda = limpiarMonedaYDetalle(prodSeleccionado.detalle);

        if (ajuste.tipo === 'SALIDA' && prodSeleccionado.stock < parseInt(ajuste.cantidad)) {
            return mostrarNotificacion(`No puedes quitar ${ajuste.cantidad}. Solo tienes ${prodSeleccionado.stock} en stock.`, 'error');
        }

        try {
            await api.post('/productos/ajustar-stock', {
                producto_id: prodSeleccionado.id,
                nombre_producto: prodSeleccionado.nombre,
                tipo: ajuste.tipo,
                cantidad: parseInt(ajuste.cantidad),
                nota: ajuste.nota,
                moneda: infoMoneda.moneda,
                precio: prodSeleccionado.precio
            });
            mostrarNotificacion('¡Movimiento de almacén procesado y guardado en Kardex!');
            setAjuste({ productoId: '', tipo: 'INGRESO', cantidad: '', nota: '' });
            setBusquedaAjuste(''); // Limpiar buscador
            cargarDatos();
        } catch (error) {
            mostrarNotificacion('Error al procesar el ajuste de stock.', 'error');
        }
    };

    const exportarKardexExcel = () => {
        if(historial.length === 0) return mostrarNotificacion('No hay movimientos para exportar.', 'error');
        const datosExcel = historial.map(h => ({
            'ID Registro': h.id,
            'Fecha y Hora': new Date(h.fecha_hora).toLocaleString(),
            'ID Producto': h.producto_id,
            'Producto': h.nombre_producto,
            'Tipo de Movimiento': h.tipo,
            'Cantidad': h.cantidad,
            'Moneda': h.moneda,
            'Precio': h.precio,
            'Motivo / Nota': h.nota
        }));
        const hoja = XLSX.utils.json_to_sheet(datosExcel);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Kardex");
        XLSX.writeFile(libro, `Kardex_GLI_${new Date().toISOString().slice(0,10)}.xlsx`);
    };

    // Filtrar los productos para el selector basándose en lo que escribe el usuario
    const productosFiltradosAjuste = productos.filter(p => 
        p.nombre.toLowerCase().includes(busquedaAjuste.toLowerCase()) || 
        p.id.toString().includes(busquedaAjuste)
    );

    return (
        <div className="dashboard-container" style={{ display: 'block', maxWidth: '1200px', margin: '40px auto', position: 'relative' }}>
            
            {/* COMPONENTE DE NOTIFICACIÓN PROPIA (TOAST) */}
            {toast.visible && (
                <div style={{
                    position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
                    backgroundColor: toast.tipo === 'error' ? 'var(--accent)' : 'var(--success)',
                    color: 'white', padding: '15px 30px', borderRadius: '8px', zIndex: 99999,
                    boxShadow: 'var(--shadow-lg)', fontWeight: 'bold', fontSize: '15px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    animation: 'fadeIn 0.3s ease-in-out'
                }}>
                    <span>{toast.tipo === 'error' ? '⚠️' : '✅'}</span>
                    {toast.mensaje}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: 'var(--primary)', margin: 0 }}>Control de Inventario y Kardex</h2>
            </div>

            {/* SECCIÓN SUPERIOR: Formularios usando la clase "card" de tu diseño original */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '30px' }}>
                
                {/* TARJETA 1: Nuevo Producto */}
                <div className="card" style={{ padding: '25px' }}>
                    <h3 style={{ margin: '0 0 15px 0', color: 'var(--primary)', fontSize: '18px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                        ✨ Registrar Nuevo Producto
                    </h3>
                    <form onSubmit={registrarProducto} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
                            <input type="number" placeholder="ID" className="input-control" value={nuevoProd.id} onChange={e => setNuevoProd({...nuevoProd, id: e.target.value})} />
                            <input type="text" placeholder="Nombre completo" className="input-control" value={nuevoProd.nombre} onChange={e => setNuevoProd({...nuevoProd, nombre: e.target.value.toUpperCase()})} required />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {/* DETALLE YA NO ES OBLIGATORIO */}
                            <input type="text" placeholder="Detalle (Opcional)" className="input-control" value={nuevoProd.detalle} onChange={e => setNuevoProd({...nuevoProd, detalle: e.target.value})} />
                            <select className="input-control" value={nuevoProd.moneda} onChange={e => setNuevoProd({...nuevoProd, moneda: e.target.value})}>
                                <option value="S/.">Soles (S/.)</option>
                                <option value="$">Dólares ($)</option>
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <input type="number" placeholder="Stock Inicial" className="input-control" value={nuevoProd.stock} onChange={e => setNuevoProd({...nuevoProd, stock: e.target.value})} />
                            <input type="number" step="0.01" placeholder="Precio" className="input-control" value={nuevoProd.precio} onChange={e => setNuevoProd({...nuevoProd, precio: e.target.value})} required />
                        </div>
                        <button type="submit" className="btn btn-success" style={{ marginTop: '5px' }}>Añadir al Catálogo</button>
                    </form>
                </div>

                {/* TARJETA 2: Ajuste de Stock */}
                <div className="card" style={{ padding: '25px' }}>
                    <h3 style={{ margin: '0 0 15px 0', color: 'var(--primary)', fontSize: '18px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                        🔄 Ajuste de Stock Manual
                    </h3>
                    <form onSubmit={procesarAjusteStock} style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                        
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted)' }}>1. Buscar y seleccionar producto:</label>
                            {/* BUSCADOR AMIGABLE */}
                            <input 
                                type="text" 
                                placeholder="🔍 Buscar por nombre..." 
                                className="input-control" 
                                value={busquedaAjuste}
                                onChange={(e) => {
                                    setBusquedaAjuste(e.target.value);
                                    setAjuste({...ajuste, productoId: ''}); // Reiniciar selección al buscar
                                }}
                                style={{ marginBottom: '8px', marginTop: '5px' }}
                            />
                            <select required className="input-control" value={ajuste.productoId} onChange={e => setAjuste({...ajuste, productoId: e.target.value})}>
                                <option value="">-- Selecciona de la lista --</option>
                                {productosFiltradosAjuste.map(p => (
                                    <option key={p.id} value={p.id}>[{p.id}] {p.nombre} (Stock: {p.stock})</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted)' }}>2. Operación:</label>
                                <select className="input-control" style={{ marginTop:'5px' }} value={ajuste.tipo} onChange={e => setAjuste({...ajuste, tipo: e.target.value})}>
                                    <option value="INGRESO">🟢 Agregar (+)</option>
                                    <option value="SALIDA">🔴 Quitar (-)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Cantidad:</label>
                                <input type="number" min="1" required className="input-control" style={{ marginTop:'5px' }} placeholder="Cant." value={ajuste.cantidad} onChange={e => setAjuste({...ajuste, cantidad: e.target.value})} />
                            </div>
                        </div>

                        <div style={{ flex: 1, display:'flex', flexDirection:'column' }}>
                            <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted)' }}>3. Motivo del movimiento:</label>
                            <textarea required className="input-control" rows="2" style={{ marginTop:'5px', flex: 1, resize:'none' }} placeholder="Ej: Mercadería de almacén central..." value={ajuste.nota} onChange={e => setAjuste({...ajuste, nota: e.target.value})} />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '5px' }}>Procesar Movimiento</button>
                    </form>
                </div>

            </div>

            {/* SECCIÓN INFERIOR: Tablas usando la clase "card" y "table-responsive" de tu diseño */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '15px 20px', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={() => setPestanaActiva('inventario')} 
                            className="btn"
                            style={{ backgroundColor: pestanaActiva === 'inventario' ? 'var(--primary)' : 'transparent', color: pestanaActiva === 'inventario' ? 'white' : 'var(--text-muted)', boxShadow: 'none' }}
                        >
                            📦 Stock Actual ({productos.length})
                        </button>
                        <button 
                            onClick={() => setPestanaActiva('historial')} 
                            className="btn"
                            style={{ backgroundColor: pestanaActiva === 'historial' ? 'var(--primary)' : 'transparent', color: pestanaActiva === 'historial' ? 'white' : 'var(--text-muted)', boxShadow: 'none' }}
                        >
                            📋 Historial / Kardex ({historial.length})
                        </button>
                    </div>

                    {pestanaActiva === 'historial' && (
                        <button onClick={exportarKardexExcel} className="btn btn-success" style={{ width: 'auto', padding: '8px 15px', fontSize: '13px' }}>
                            📊 Exportar a Excel
                        </button>
                    )}
                </div>

                <div className="table-responsive" style={{ margin: 0, border: 'none', boxShadow: 'none', maxHeight: '500px' }}>
                    
                    {pestanaActiva === 'inventario' && (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Producto</th>
                                    <th>Detalle</th>
                                    <th style={{ textAlign: 'center' }}>Stock Disponible</th>
                                    <th style={{ textAlign: 'right' }}>Precio Lista</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.map(p => {
                                    const info = limpiarMonedaYDetalle(p.detalle);
                                    return (
                                        <tr key={p.id}>
                                            <td style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>#{p.id}</td>
                                            <td style={{ fontWeight: '600' }}>{p.nombre}</td>
                                            <td>{info.presentacion}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{ 
                                                    padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', 
                                                    backgroundColor: p.stock === 0 ? '#fee2e2' : p.stock <= 5 ? '#fef3c7' : '#dcfce7',
                                                    color: p.stock === 0 ? '#ef4444' : p.stock <= 5 ? '#d97706' : '#16a34a'
                                                }}>
                                                    {p.stock} u.
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 'bold', color: info.moneda === '$' ? '#d97706' : 'var(--primary)' }}>
                                                {info.moneda} {Number(p.precio).toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}

                    {pestanaActiva === 'historial' && (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th>Fecha / Hora</th>
                                    <th>Producto</th>
                                    <th style={{ textAlign: 'center' }}>Tipo</th>
                                    <th style={{ textAlign: 'center' }}>Cant.</th>
                                    <th>Motivo de la Operación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historial.map(h => (
                                    <tr key={h.id} style={{ backgroundColor: h.tipo === 'SALIDA' ? '#fff5f5' : 'transparent' }}>
                                        <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                            {new Date(h.fecha_hora).toLocaleString()}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 'bold' }}>{h.nombre_producto}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID Prod: #{h.producto_id} • {h.moneda} {Number(h.precio).toFixed(2)}</div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{ 
                                                padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', 
                                                backgroundColor: h.tipo === 'INGRESO' ? '#dcfce7' : '#fee2e2',
                                                color: h.tipo === 'INGRESO' ? '#15803d' : '#b91c1c'
                                            }}>
                                                {h.tipo}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '15px', color: h.tipo === 'SALIDA' ? 'var(--accent)' : 'var(--success)' }}>
                                            {h.tipo === 'INGRESO' ? `+${h.cantidad}` : `-${h.cantidad}`}
                                        </td>
                                        <td style={{ fontStyle: 'italic' }}>
                                            "{h.nota}"
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            
        </div>
    );
}
