import { useState, useMemo, useEffect } from 'react';
import { Modal, ConfirmarSuspender } from '../componentes/AdminModals';
import { api } from '../servicios/api';

const formularioVacio = { fecha: '', cliente: '', total: '', items: '', estado: 'Pendiente', metodo: 'Efectivo' };

export default function Ventas() {
  const [datos, setDatos] = useState([]);

  // Cargar ventas directamente desde MySQL
  useEffect(() => {
    api.get('/ventas').then((res) => {
      if (Array.isArray(res)) setDatos(res);
    });
  }, []);

  // Estados de filtrado especializado
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroMetodo, setFiltroMetodo] = useState('Todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [montoMin, setMontoMin] = useState('');
  const [montoMax, setMontoMax] = useState('');
  const [orden, setOrden] = useState('fecha-desc');
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);

  // Modales
  const [modal, setModal] = useState(null);
  const [actual, setActual] = useState(null);
  const [formulario, setFormulario] = useState(formularioVacio);

  const guardarEnStorage = (nuevas) => {
    try {
      localStorage.setItem('novacasa_ventas', JSON.stringify(nuevas));
    } catch (e) {
      console.error(e);
    }
  };

  // Conteo reactivo por estado
  const conteoEstados = useMemo(() => {
    return {
      Todos: datos.length,
      Completada: datos.filter((v) => v.estado === 'Completada').length,
      Pendiente: datos.filter((v) => v.estado === 'Pendiente').length,
      Cancelada: datos.filter((v) => v.estado === 'Cancelada').length,
      Reembolsada: datos.filter((v) => v.estado === 'Reembolsada').length,
    };
  }, [datos]);

  // Filtrado y ordenamiento de ventas
  const filtrados = useMemo(() => {
    return datos
      .filter((v) => {
        // Búsqueda por texto
        if (busqueda.trim()) {
          const q = busqueda.toLowerCase().trim();
          const coincideId = v.id.toString().includes(q);
          const coincideCliente = v.cliente.toLowerCase().includes(q);
          const coincideMetodo = v.metodo.toLowerCase().includes(q);
          if (!coincideId && !coincideCliente && !coincideMetodo) return false;
        }

        // Filtro por estado
        if (filtroEstado !== 'Todos' && v.estado !== filtroEstado) return false;

        // Filtro por método de pago
        if (filtroMetodo !== 'Todos' && v.metodo !== filtroMetodo) return false;

        // Filtro por período relativo
        if (filtroPeriodo !== 'todos') {
          const hoy = new Date();
          const fechaVenta = new Date(v.fecha);
          const diffDias = Math.floor((hoy - fechaVenta) / (1000 * 60 * 60 * 24));

          if (filtroPeriodo === 'hoy' && diffDias !== 0) return false;
          if (filtroPeriodo === 'semana' && (diffDias < 0 || diffDias > 7)) return false;
          if (filtroPeriodo === 'mes' && (diffDias < 0 || diffDias > 30)) return false;
        }

        // Filtro por rango de fechas exacto
        if (fechaDesde && v.fecha < fechaDesde) return false;
        if (fechaHasta && v.fecha > fechaHasta) return false;

        // Filtro por monto
        const totalNum = Number(v.total) || 0;
        if (montoMin !== '' && totalNum < Number(montoMin)) return false;
        if (montoMax !== '' && totalNum > Number(montoMax)) return false;

        return true;
      })
      .sort((a, b) => {
        if (orden === 'fecha-desc') return new Date(b.fecha) - new Date(a.fecha);
        if (orden === 'fecha-asc') return new Date(a.fecha) - new Date(b.fecha);
        if (orden === 'monto-desc') return Number(b.total) - Number(a.total);
        if (orden === 'monto-asc') return Number(a.total) - Number(b.total);
        if (orden === 'items-desc') return b.items - a.items;
        if (orden === 'cliente-asc') return a.cliente.localeCompare(b.cliente);
        return 0;
      });
  }, [datos, busqueda, filtroEstado, filtroMetodo, filtroPeriodo, fechaDesde, fechaHasta, montoMin, montoMax, orden]);

  // Métricas resumidas
  const metricasFiltradas = useMemo(() => {
    const totalSuma = filtrados.reduce((sum, v) => sum + (Number(v.total) || 0), 0);
    const totalCompletadas = filtrados
      .filter((v) => v.estado === 'Completada')
      .reduce((sum, v) => sum + (Number(v.total) || 0), 0);
    const cantidadItems = filtrados.reduce((sum, v) => sum + (Number(v.items) || 0), 0);
    const ticketPromedio = filtrados.length > 0 ? Math.round(totalSuma / filtrados.length) : 0;

    return { totalSuma, totalCompletadas, cantidadItems, ticketPromedio };
  }, [filtrados]);

  // Verificar si hay algún filtro activo
  const hayFiltrosActivos =
    busqueda !== '' ||
    filtroEstado !== 'Todos' ||
    filtroMetodo !== 'Todos' ||
    filtroPeriodo !== 'todos' ||
    fechaDesde !== '' ||
    fechaHasta !== '' ||
    montoMin !== '' ||
    montoMax !== '' ||
    orden !== 'fecha-desc';

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEstado('Todos');
    setFiltroMetodo('Todos');
    setFiltroPeriodo('todos');
    setFechaDesde('');
    setFechaHasta('');
    setMontoMin('');
    setMontoMax('');
    setOrden('fecha-desc');
  };

  // Exportar ventas filtradas a formato CSV
  const exportarCSV = () => {
    if (filtrados.length === 0) return;
    const encabezados = ['ID Venta', 'Fecha', 'Cliente', 'Items', 'Total (COP)', 'Metodo de Pago', 'Estado'];
    const filas = filtrados.map((v) => [
      `"${v.id}"`,
      `"${v.fecha}"`,
      `"${v.cliente}"`,
      v.items,
      v.total,
      `"${v.metodo}"`,
      `"${v.estado}"`,
    ]);
    const contenido = [encabezados.join(','), ...filas.map((f) => f.join(','))].join('\n');
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const abrirCrear = () => {
    setFormulario({ ...formularioVacio, fecha: new Date().toISOString().split('T')[0] });
    setActual(null);
    setModal('crear');
  };
  const abrirEditar = (elem) => { setFormulario({ ...elem }); setActual(elem); setModal('editar'); };
  const abrirSuspender = (elem) => { setActual(elem); setModal('suspender'); };

  const guardar = async () => {
    if (!formulario.cliente.trim()) return;
    const total = Number(formulario.total) || 0;
    const items = Number(formulario.items) || 0;
    const payload = { ...formulario, total, items };

    if (modal === 'crear') {
      try {
        const nueva = await api.post('/ventas', payload);
        const actualizadas = [
          ...datos,
          { ...payload, id: nueva.id_venta || Date.now() },
        ];
        setDatos(actualizadas);
        guardarEnStorage(actualizadas);
      } catch {
        const actualizadas = [
          ...datos,
          { ...payload, id: Date.now() },
        ];
        setDatos(actualizadas);
        guardarEnStorage(actualizadas);
      }
    } else {
      try {
        await api.put(`/ventas/${actual.id}/estado`, { estado: formulario.estado });
      } catch (e) {
        console.warn('Fallback local para actualizar venta:', e);
      }
      const actualizadas = datos.map((v) =>
        v.id === actual.id ? { ...payload, id: actual.id } : v
      );
      setDatos(actualizadas);
      guardarEnStorage(actualizadas);
    }
    setModal(null);
  };

  const suspender = async () => {
    const actualizadas = datos.map((v) => {
      if (v.id === actual.id) {
        const nuevoEstado = v.estado === 'Cancelada' ? (v.estadoAnterior || 'Pendiente') : 'Cancelada';
        return {
          ...v,
          estado: nuevoEstado,
          estadoAnterior: v.estado !== 'Cancelada' ? v.estado : v.estadoAnterior,
        };
      }
      return v;
    });
    setDatos(actualizadas);
    guardarEnStorage(actualizadas);
    setModal(null);
  };

  const insigniaEstado = {
    Completada: 'completado',
    Pendiente: 'pendiente',
    Cancelada: 'cancelado',
    Reembolsada: 'cancelado',
  };

  return (
    <>
      {/* ENCABEZADO DE LA SECCIÓN */}
      <div className="crud-encabezado">
        <div className="crud-encabezado-izq">
          <h2>Gestión de Ventas</h2>
          <p>
            Supervisa, filtra y gestiona todas las transacciones comerciales en tiempo real.
          </p>
        </div>
        <div className="crud-acciones" style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-secundario"
            onClick={exportarCSV}
            title="Descargar reporte en formato CSV"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              background: 'var(--tarjeta-blanca)',
              border: '1px solid var(--tarjeta-borde)',
              color: 'var(--texto-principal)',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar CSV
          </button>
          <button className="btn-primario" onClick={abrirCrear}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nueva Venta
          </button>
        </div>
      </div>

      {/* TARJETAS DE MÉTRICAS DINÁMICAS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            background: 'var(--tarjeta-blanca)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--tarjeta-borde)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Filtrado
          </span>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--texto-principal)', marginTop: '4px' }}>
            ${metricasFiltradas.totalSuma.toLocaleString('es-CO')}
          </div>
          <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600, marginTop: '2px', display: 'block' }}>
            ${metricasFiltradas.totalCompletadas.toLocaleString('es-CO')} completado
          </span>
        </div>

        <div
          style={{
            background: 'var(--tarjeta-blanca)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--tarjeta-borde)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Ventas Coincidentes
          </span>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--texto-principal)', marginTop: '4px' }}>
            {filtrados.length} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--texto-secundario)' }}>de {datos.length}</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--texto-secundario)', marginTop: '2px', display: 'block' }}>
            {metricasFiltradas.cantidadItems} unidades vendidas
          </span>
        </div>

        <div
          style={{
            background: 'var(--tarjeta-blanca)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--tarjeta-borde)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Ticket Promedio
          </span>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#3B82F6', marginTop: '4px' }}>
            ${metricasFiltradas.ticketPromedio.toLocaleString('es-CO')}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--texto-secundario)', marginTop: '2px', display: 'block' }}>
            Por transacción
          </span>
        </div>
      </div>

      {/* PANEL DE FILTRADO ESPECIALIZADO */}
      <div
        style={{
          background: 'var(--tarjeta-blanca)',
          padding: '16px 20px',
          borderRadius: '14px',
          border: '1px solid var(--tarjeta-borde)',
          marginBottom: '18px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        }}
      >
        {/* FILA 1: BOTONES DE ESTADO + ACCIONES */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '14px',
          }}
        >
          {/* Botones de filtro de estado (con estilo dorado y negro) */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Todos', 'Completada', 'Pendiente', 'Cancelada', 'Reembolsada'].map((est) => {
              const activo = filtroEstado === est;
              return (
                <button
                  key={est}
                  onClick={() => setFiltroEstado(est)}
                  className={`filtro-estado-btn ${activo ? 'activo' : ''}`}
                >
                  <span>{est}</span>
                  <span className="filtro-estado-badge">
                    {conteoEstados[est] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Botón limpiar y filtros avanzados */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                style={{
                  background: 'transparent',
                  border: '1px solid #EF4444',
                  color: '#EF4444',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  transition: 'background 0.15s ease',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Limpiar filtros
              </button>
            )}
            <button
              onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '8px',
                border: mostrarFiltrosAvanzados ? '1px solid var(--amarillo)' : '1px solid var(--tarjeta-borde)',
                background: mostrarFiltrosAvanzados ? 'var(--amarillo-fondo)' : 'var(--tarjeta-blanca)',
                color: 'var(--texto-principal)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              {mostrarFiltrosAvanzados ? 'Ocultar filtros avanzados' : 'Filtros avanzados'}
            </button>
          </div>
        </div>

        {/* FILA 2: CONTROLES DE BÚSQUEDA Y SELECTORES */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          {/* Buscador */}
          <div className="campo-busqueda" style={{ margin: 0, width: '100%', maxWidth: 'none' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" width="15" height="15">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar cliente, ID, total..."
              style={{ width: '100%' }}
            />
          </div>

          {/* Método de pago */}
          <select
            value={filtroMetodo}
            onChange={(e) => setFiltroMetodo(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid var(--tarjeta-borde)',
              background: 'var(--tarjeta-blanca)',
              color: 'var(--texto-principal)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="Todos">Todos los métodos de pago</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
          </select>

          {/* Período */}
          <select
            value={filtroPeriodo}
            onChange={(e) => setFiltroPeriodo(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid var(--tarjeta-borde)',
              background: 'var(--tarjeta-blanca)',
              color: 'var(--texto-principal)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="todos">Todas las fechas</option>
            <option value="hoy">Hoy</option>
            <option value="ultimos7">Últimos 7 días</option>
            <option value="mes">Este mes</option>
            <option value="personalizado">Rango de fechas personalizado</option>
          </select>

          {/* Orden */}
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid var(--tarjeta-borde)',
              background: 'var(--tarjeta-blanca)',
              color: 'var(--texto-principal)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="fecha-desc">Fecha: Más recientes primero</option>
            <option value="fecha-asc">Fecha: Más antiguas primero</option>
            <option value="total-desc">Total: Mayor a menor</option>
            <option value="total-asc">Total: Menor a mayor</option>
            <option value="items-desc">Más cantidad de ítems</option>
            <option value="cliente-asc">Cliente (A - Z)</option>
          </select>
        </div>

        {/* FILA 3: FILTROS AVANZADOS (FECHAS Y MONTOS) */}
        {mostrarFiltrosAvanzados && (
          <div
            style={{
              marginTop: '14px',
              paddingTop: '14px',
              borderTop: '1px dashed var(--tarjeta-borde)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            {/* Fecha Desde */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--texto-secundario)' }}>
                Fecha Inicial:
              </label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => {
                  setFechaDesde(e.target.value);
                  setFiltroPeriodo('personalizado');
                }}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--tarjeta-borde)',
                  background: 'var(--tarjeta-blanca)',
                  color: 'var(--texto-principal)',
                  fontSize: '12px',
                }}
              />
            </div>

            {/* Fecha Hasta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--texto-secundario)' }}>
                Fecha Final:
              </label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => {
                  setFechaHasta(e.target.value);
                  setFiltroPeriodo('personalizado');
                }}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--tarjeta-borde)',
                  background: 'var(--tarjeta-blanca)',
                  color: 'var(--texto-principal)',
                  fontSize: '12px',
                }}
              />
            </div>

            {/* Monto Mínimo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--texto-secundario)' }}>
                Monto Mínimo (COP):
              </label>
              <input
                type="number"
                placeholder="Ej. 100000"
                value={montoMin}
                onChange={(e) => setMontoMin(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--tarjeta-borde)',
                  background: 'var(--tarjeta-blanca)',
                  color: 'var(--texto-principal)',
                  fontSize: '12px',
                }}
              />
            </div>

            {/* Monto Máximo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--texto-secundario)' }}>
                Monto Máximo (COP):
              </label>
              <input
                type="number"
                placeholder="Ej. 2000000"
                value={montoMax}
                onChange={(e) => setMontoMax(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--tarjeta-borde)',
                  background: 'var(--tarjeta-blanca)',
                  color: 'var(--texto-principal)',
                  fontSize: '12px',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* TABLA DE RESULTADOS */}
      <div className="tabla-contenedor">
        <table className="tabla-panel">
          <thead>
            <tr>
              <th>ID Venta</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Ítems</th>
              <th>Total</th>
              <th>Método de Pago</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="estado-vacio" style={{ padding: '36px 16px' }}>
                    <IconoVentasSVG width="44" height="44" style={{ color: '#A1A1AA', marginBottom: 12 }} />
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px 0' }}>
                      No se encontraron ventas
                    </h3>
                    <p style={{ color: 'var(--texto-secundario)', fontSize: '13px', margin: '0 0 12px 0' }}>
                      Ninguna venta coincide con los criterios de filtrado seleccionados.
                    </p>
                    {hayFiltrosActivos && (
                      <button
                        onClick={limpiarFiltros}
                        className="btn-primario"
                        style={{ fontSize: '12px', padding: '6px 14px' }}
                      >
                        Restablecer filtros
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filtrados.map((v) => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 700, color: 'var(--texto-principal)' }}>
                    #{String(v.id).slice(-4).padStart(4, '0')}
                  </td>
                  <td style={{ color: 'var(--texto-secundario)', fontSize: 13 }}>{v.fecha}</td>
                  <td style={{ fontWeight: 700 }}>{v.cliente}</td>
                  <td style={{ color: 'var(--texto-secundario)' }}>{v.items} ítem(s)</td>
                  <td style={{ fontWeight: 800, color: 'var(--texto-principal)' }}>
                    ${Number(v.total).toLocaleString('es-CO')}
                  </td>
                  <td>
                    <span className={`badge-metodo ${v.metodo.toLowerCase()}`}>
                      {v.metodo}
                    </span>
                  </td>
                  <td>
                    <span className={`insignia-estado ${insigniaEstado[v.estado] || 'proceso'}`}>
                      {v.estado}
                    </span>
                  </td>
                  <td>
                    <div className="acciones-tabla">
                      <button className="btn-accion editar" onClick={() => abrirEditar(v)} title="Editar venta">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className={`btn-accion ${v.estado === 'Cancelada' ? 'reactivar' : 'suspender'}`}
                        onClick={() => abrirSuspender(v)}
                        title={v.estado === 'Cancelada' ? 'Reactivar venta' : 'Suspender/Anular venta'}
                      >
                        {v.estado === 'Cancelada' ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PIE DE TABLA */}
        <div className="crud-paginacion" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="paginacion-info">
            Mostrando <strong>{filtrados.length}</strong> de <strong>{datos.length}</strong> ventas registradas
          </span>
          <span style={{ fontSize: '12px', color: 'var(--texto-secundario)' }}>
            Suma parcial:{' '}
            <strong style={{ color: 'var(--texto-principal)' }}>
              ${metricasFiltradas.totalSuma.toLocaleString('es-CO')}
            </strong>
          </span>
        </div>
      </div>

      {/* MODAL CREAR / EDITAR */}
      {(modal === 'crear' || modal === 'editar') && (
        <Modal titulo={modal === 'crear' ? 'Nueva Venta' : 'Editar Venta'} alCerrar={() => setModal(null)} alGuardar={guardar}>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Fecha</label>
              <input type="date" value={formulario.fecha} onChange={(e) => setFormulario({ ...formulario, fecha: e.target.value })} />
            </div>
            <div className="grupo-campo">
              <label>Estado</label>
              <select value={formulario.estado} onChange={(e) => setFormulario({ ...formulario, estado: e.target.value })}>
                <option>Pendiente</option>
                <option>Completada</option>
                <option>Cancelada</option>
                <option>Reembolsada</option>
              </select>
            </div>
          </div>
          <div className="grupo-campo">
            <label>Cliente *</label>
            <input value={formulario.cliente} onChange={(e) => setFormulario({ ...formulario, cliente: e.target.value })} placeholder="Nombre del cliente" />
          </div>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Total (COP)</label>
              <input type="number" value={formulario.total} onChange={(e) => setFormulario({ ...formulario, total: e.target.value })} placeholder="0" />
            </div>
            <div className="grupo-campo">
              <label>Cantidad de Ítems</label>
              <input type="number" value={formulario.items} onChange={(e) => setFormulario({ ...formulario, items: e.target.value })} placeholder="1" min="1" />
            </div>
          </div>
          <div className="grupo-campo">
            <label>Método de Pago</label>
            <select value={formulario.metodo} onChange={(e) => setFormulario({ ...formulario, metodo: e.target.value })}>
              <option>Efectivo</option>
              <option>Tarjeta</option>
              <option>Transferencia</option>
            </select>
          </div>
        </Modal>
      )}

      {/* MODAL CONFIRMAR SUSPENDER */}
      {modal === 'suspender' && (
        <ConfirmarSuspender
          nombreElemento={`Venta #${String(actual?.id).slice(-4)} (${actual?.cliente})`}
          estadoActual={actual?.estado}
          alCerrar={() => setModal(null)}
          alConfirmar={suspender}
        />
      )}
    </>
  );
}

function IconoVentasSVG(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
}
