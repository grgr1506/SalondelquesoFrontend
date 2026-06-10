import React, { useState, useEffect } from 'react';
import api from '../services/api';
import * as XLSX from 'xlsx';

export default function AdminStock() {
    const [productos, setProductos] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [pestanaActiva, setPestanaActiva] = useState('inventario'); // 'inventario' o 'historial'

    // Formulario de Producto Nuevo
    const [nuevoProd, setNuevoProd] = useState({ id: '', nombre: '', detalle: '', stock: 0, precio: '', moneda: 'S/.' });
    
    // Formulario de Ajuste de Stock
    const [ajuste, setAjuste] = useState({ productoId: '', tipo: 'INGRESO', cantidad: '', nota: '' });

    const cargarDatos = async () => {
        try {
            const resProds = await api.get('/productos');
            setProductos(resProds.data);
            const resHist = await api.get('/reposiciones');
            setHistorial(resHist.data);
        } catch (error) {
            console.error('Error al cargar datos de inventario:', error);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const limpiarMonedaYDetalle = (detalleStr) => {
        if (!detalleStr) return { presentacion: '-', moneda: 'S/.' };
        const tieneDolar = detalleStr.includes('($)');
        const tieneSol = detalleStr.includes('(S/.)');
        let presentacion = detalleStr.replace('(S/.)', '').replace('($)', '').trim();
        return {
            presentacion,
            moneda: tieneDolar ? '$' : 'S/.'
        };
    };

    const registrarProducto = async (e) => {
        e.preventDefault();
        if(!nuevoProd.nombre || !nuevoProd.precio) return alert('Completa los campos obligatorios.');
        try {
            await api.post('/productos', nuevoProd);
            alert('✅ Producto registrado en catálogo e historial.');
            setNuevoProd({ id: '', nombre: '', detalle: '', stock: 0, precio: '', moneda: 'S/.' });
            cargarDatos();
        } catch (error) {
            alert('Error al registrar producto.');
        }
    };

    const procesarAjusteStock = async (e) => {
        e.preventDefault();
        if(!ajuste.productoId || !ajuste.cantidad || !ajuste.nota) return alert('Completa todos los campos del ajuste.');
        
        const prodSeleccionado = productos.find(p => p.id === parseInt(ajuste.productoId));
        if(!prodSeleccionado) return;

        const infoMoneda = limpiarMonedaYDetalle(prodSeleccionado.detalle);

        if (ajuste.tipo === 'SALIDA' && prodSeleccionado.stock < parseInt(ajuste.cantidad)) {
            return alert(`⚠️ Operación inválida. Solo tienes ${prodSeleccionado.stock} unidades en stock.`);
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
            alert('✅ Movimiento de almacén procesado con éxito.');
            setAjuste({ productoId: '', tipo: 'INGRESO', cantidad: '', nota: '' });
            cargarDatos();
        } catch (error) {
            alert('Error al procesar el ajuste de stock.');
        }
    };

    const exportarKardexExcel = () => {
        if(historial.length === 0) return alert('No hay movimientos registrados.');
        const datosExcel = historial.map(h => ({
            'ID Registro': h.id,
            'Fecha y Hora': new Date(h.fecha_hora).toLocaleString(),
            'ID Producto': h.producto_id,
            'Producto': h.nombre_producto,
            'Tipo de Movimiento': h.tipo === 'INGRESO' ? '🟢 ENTRADA/REPOSICIÓN' : '🔴 SALIDA/AJUSTE',
            'Cantidad': h.cantidad,
            'Moneda Base': h.moneda,
            'Precio Reg.': h.precio,
            'Motivo / Nota de Ajuste': h.nota
        }));
        const hoja = XLSX.utils.json_to_sheet(datosExcel);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Kardex Almacen");
        XLSX.writeFile(libro, `Historial_Reposiciones_${new Date().toISOString().slice(0,10)}.xlsx`);
    };

    return (
        <div style={{ 
            display: 'flex', 
            gap: '20px', 
            maxWidth: '1310px', 
            margin: '20px auto', 
            height: '720px', 
            boxSizing: 'border-box',
            fontFamily: 'sans-serif'
        }}>
            
            {/* PANEL IZQUIERDO: FORMULARIOS */}
            <div style={{ width: '360px', display: 'flex', flexDirection: 'column', gap: '15px', height: '100%' }}>
                
                {/* FORMULARIO 1: REGISTRAR PRODUCTO NUEVO */}
                <div style={{ background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: '0 0 12px 0', color: '#1e3a8a', fontSize: '16px', borderBottom: '2px solid #f1f5f9', paddingBottom: '5px' }}>✨ Nuevo Producto</h3>
                    <form onSubmit={registrarProducto} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px' }}>
                            <input type="number" placeholder="ID (Opc.)" className="input-control" style={{padding:'6px'}} value={nuevoProd.id} onChange={e => setNuevoProd({...nuevoProd, id: e.target.value})} />
                            <input type="text" placeholder="Nombre del producto" className="input-control" style={{padding:'6px'}} value={nuevoProd.nombre} onChange={e => setNuevoProd({...nuevoProd, nombre: e.target.value.toUpperCase()})} required />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <input type="text" placeholder="Presen. (Ej: Kg, Sobre)" className="input-control" style={{padding:'6px'}} value={nuevoProd.detalle} onChange={e => setNuevoProd({...nuevoProd, detalle: e.target.value})} required />
                            <select className="input-control" style={{padding:'6px'}} value={nuevoProd.moneda} onChange={e => setNuevoProd({...nuevoProd, moneda: e.target.value})}>
                                <option value="S/.">Soles (S/.)</option>
                                <option value="$">Dólares ($)</option>
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <input type="number" placeholder="Stock Inicial" className="input-control" style={{padding:'6px'}} value={nuevoProd.stock} onChange={e => setNuevoProd({...nuevoProd, stock: e.target.value})} />
                            <input type="number" step="0.01" placeholder="Precio" className="input-control" style={{padding:'6px'}} value={nuevoProd.precio} onChange={e => setNuevoProd({...nuevoProd, precio: e.target.value})} required />
                        </div>
                        <button type="submit" className="btn btn-success" style={{ padding: '8px', fontWeight: 'bold', width:'100%', cursor:'pointer' }}>Añadir al Catálogo</button>
                    </form>
                </div>

                {/* FORMULARIO 2: AJUSTAR STOCK */}
                <div style={{ background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', flex: 1, display:'flex', flexDirection:'column' }}>
                    <h3 style={{ margin: '0 0 12px 0', color: '#1e3a8a', fontSize: '16px', borderBottom: '2px solid #f1f5f9', paddingBottom: '5px' }}>🔄 Ajuste de Stock Manual</h3>
                    <form onSubmit={procesarAjusteStock} style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex:1 }}>
                        
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>1. Selecciona el Producto:</label>
                            <select required className="input-control" style={{ width:'100%', marginTop:'3px', padding:'6px' }} value={ajuste.productoId} onChange={e => setAjuste({...ajuste, productoId: e.target.value})}>
                                <option value="">-- Buscar Producto --</option>
                                {productos.map(p => {
                                    const info = limpiarMonedaYDetalle(p.detalle);
                                    return (
                                        <option key={p.id} value={p.id}>[{p.id}] {p.nombre} (Stock: {p.stock})</option>
                                    )
                                })}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>2. Operación:</label>
                                <select className="input-control" style={{ width:'100%', marginTop:'3px', padding:'6px' }} value={ajuste.tipo} onChange={e => setAjuste({...ajuste, tipo: e.target.value})}>
                                    <option value="INGRESO">🟢 Agregar Stock (+)</option>
                                    <option value="SALIDA">🔴 Quitar Stock (-)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Cantidad:</label>
                                <input type="number" min="1" required className="input-control" style={{ width:'100%', marginTop:'3px', padding:'6px', boxSizing:'border-box' }} placeholder="Cant." value={ajuste.cantidad} onChange={e => setAjuste({...ajuste, cantidad: e.target.value})} />
                            </div>
                        </div>

                        <div style={{ flex: 1, display:'flex', flexDirection:'column' }}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>3. Escribe el Motivo / Justificación:</label>
                            <textarea required className="input-control" rows="3" style={{ width:'100%', marginTop:'3px', padding:'8px', flex: 1, resize:'none', boxSizing:'border-box' }} placeholder="Ej: Se trajeron 2 cajas más de almacén central / Producto dañado en traslado..." value={ajuste.nota} onChange={e => setAjuste({...ajuste, nota: e.target.value})} />
                        </div>

                        <button type="submit" className="btn" style={{ padding: '10px', backgroundColor: '#2563eb', color: 'white', fontWeight: 'bold', width:'100%', border:'none', borderRadius:'6px', cursor:'pointer' }}>
                            Procesar Movimiento
                        </button>
                    </form>
                </div>

            </div>

            {/* PANEL DERECHO: PESTAÑAS */}
            <div style={{ flex: 1, background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                
                {/* SELECTOR DE PESTAÑAS */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 15px', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={() => setPestanaActiva('inventario')} 
                            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: pestanaActiva === 'inventario' ? '#2563eb' : 'transparent', color: pestanaActiva === 'inventario' ? 'white' : '#64748b' }}
                        >
                            📦 Stock Actual ({productos.length})
                        </button>
                        <button 
                            onClick={() => setPestanaActiva('historial')} 
                            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: pestanaActiva === 'historial' ? '#2563eb' : 'transparent', color: pestanaActiva === 'historial' ? 'white' : '#64748b' }}
                        >
                            📋 Historial de Movimientos ({historial.length})
                        </button>
                    </div>

                    {pestanaActiva === 'historial' && (
                        <button onClick={exportarKardexExcel} className="btn" style={{ backgroundColor: '#059669', color: 'white', fontWeight: 'bold', padding: '6px 12px', fontSize: '13px', borderRadius: '6px', border:'none', cursor:'pointer' }}>
                            📊 Exportar Kardex a Excel
                        </button>
                    )}
                </div>

                {/* CONTENIDO INTERNO */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
                    
                    {pestanaActiva === 'inventario' && (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: '#1e3a8a', color: 'white', position: 'sticky', top: 0, textAlign:'left' }}>
                                    <th style={{ padding: '10px' }}>ID</th>
                                    <th style={{ padding: '10px' }}>Producto</th>
                                    <th style={{ padding: '10px' }}>Presentación</th>
                                    <th style={{ padding: '10px', textAlign: 'center' }}>Stock Disponible</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Precio Lista</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.map(p => {
                                    const info = limpiarMonedaYDetalle(p.detalle);
                                    return (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '10px', fontWeight: 'bold', color: '#64748b' }}>#{p.id}</td>
                                            <td style={{ padding: '10px', fontWeight: '600', color: '#1e293b' }}>{p.nombre}</td>
                                            <td style={{ padding: '10px', color: '#475569' }}>{info.presentacion}</td>
                                            <td style={{ padding: '10px', textAlign: 'center' }}>
                                                <span style={{ 
                                                    padding: '4px 10px', 
                                                    borderRadius: '12px', 
                                                    fontWeight: 'bold', 
                                                    backgroundColor: p.stock === 0 ? '#fee2e2' : p.stock <= 5 ? '#fef3c7' : '#dcfce7',
                                                    color: p.stock === 0 ? '#ef4444' : p.stock <= 5 ? '#d97706' : '#16a34a'
                                                }}>
                                                    {p.stock} u.
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: info.moneda === '$' ? '#d97706' : '#2563eb' }}>
                                                {info.moneda} {Number(p.precio).toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}

                    {pestanaActiva === 'historial' && (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: '#334155', color: 'white', position: 'sticky', top: 0, textAlign:'left' }}>
                                    <th style={{ padding: '10px' }}>Fecha / Hora</th>
                                    <th style={{ padding: '10px' }}>Producto</th>
                                    <th style={{ padding: '10px', textAlign: 'center' }}>Tipo</th>
                                    <th style={{ padding: '10px', textAlign: 'center' }}>Cant.</th>
                                    <th style={{ padding: '10px' }}>Motivo de la Operación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historial.map(h => (
                                    <tr key={h.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: h.tipo === 'SALIDA' ? '#fff5f5' : 'transparent' }}>
                                        <td style={{ padding: '10px', color: '#64748b', whiteSpace: 'nowrap' }}>
                                            {new Date(h.fecha_hora).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{h.nombre_producto}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID Prod: #{h.producto_id} • Valor: {h.moneda} {Number(h.precio).toFixed(2)}</div>
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                            <span style={{ 
                                                padding: '3px 8px', 
                                                borderRadius: '4px', 
                                                fontSize: '11px', 
                                                fontWeight: 'bold', 
                                                backgroundColor: h.tipo === 'INGRESO' ? '#dcfce7' : '#fee2e2',
                                                color: h.tipo === 'INGRESO' ? '#15803d' : '#b91c1c'
                                            }}>
                                                {h.tipo}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', color: h.tipo === 'SALIDA' ? '#ef4444' : '#10b981' }}>
                                            {h.tipo === 'INGRESO' ? `+${h.cantidad}` : `-${h.cantidad}`}
                                        </td>
                                        <td style={{ padding: '10px', color: '#334155', fontStyle: 'italic', lineHeight: '1.4' }}>
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
