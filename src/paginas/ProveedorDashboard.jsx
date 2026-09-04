import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

export default function ProveedorDashboard() {
  const context = useOutletContext();
  const nombreProveedor = context?.nombreProveedor || localStorage.getItem('novacasa_proveedor_nombre') || 'Distribuidora Central S.A.S.';

  const estadisticas = [
    {
      id: 'pedidos',
      etiqueta: 'Órdenes de Compra',
      valor: '0',
      cambio: 'Sin nuevas',
      subida: true,
      icono: IconoPedido,
      colorClase: 'tarjeta-est-azul',
    },
    {
      id: 'porCobrar',
      etiqueta: 'Facturación por Cobrar',
      valor: '$0',
      cambio: 'Sin movimientos',
      subida: true,
      icono: IconoFactura,
      colorClase: 'tarjeta-est-verde',
    },
    {
      id: 'productos',
      etiqueta: 'Productos Suministrados',
      valor: '42',
      cambio: '100% activos',
      subida: true,
      icono: IconoCaja,
      colorClase: 'tarjeta-est-morado',
    },
    {
      id: 'cumplimiento',
      etiqueta: 'Nivel de Cumplimiento',
      valor: '98.5%',
      cambio: 'Excelente',
      subida: true,
      icono: IconoEstrella,
      colorClase: 'tarjeta-est-amarillo',
    },
  ];

  const pedidosRecientes = [];

  const insigniaEstado = {
    'En Preparación': 'proceso',
    Enviado: 'proceso',
    Entregado: 'completado',
    Pendiente: 'pendiente',
  };

  return (
    <>
      {/* BANNER BIENVENIDA PROVEEDOR */}
      <div className="banner-bienvenida-novacasa">
        <div className="banner-bienvenida-izq">
          <div className="banner-icono-casa">
            <IconoEdificio className="banner-svg-icon" />
          </div>
          <div className="banner-bienvenida-texto">
            <h2>¡Bienvenido, {nombreProveedor}!</h2>
            <p>Portal de abastecimiento, órdenes de compra y control logístico con NovaCasa.</p>
          </div>
        </div>
        <div className="banner-fecha-insignia">
          <IconoCalendario width="15" height="15" />
          <span>Portal de Suministro · 2026</span>
        </div>
      </div>

      {/* TARJETAS DE MÉTRICAS */}
      <div className="grilla-estadisticas">
        {estadisticas.map((est) => (
          <div className={`tarjeta-estadistica ${est.colorClase}`} key={est.id}>
            <div className="tarjeta-est-encabezado">
              <div className="tarjeta-est-icono">
                <est.icono width="22" height="22" />
              </div>
              <span className={`badge-est-tendencia ${est.subida ? 'subida' : 'bajada'}`}>
                {est.cambio}
              </span>
            </div>
            <div className="tarjeta-est-info">
              <span className="tarjeta-est-etiqueta">{est.etiqueta}</span>
              <div className="tarjeta-est-valor">{est.valor}</div>
            </div>
          </div>
        ))}
      </div>

      {/* SECCIÓN DE PEDIDOS RECIENTES Y ACCESOS RÁPIDOS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginTop: '20px',
        }}
      >
        {/* Tabla de órdenes recientes */}
        <div
          style={{
            background: 'var(--tarjeta-blanca)',
            borderRadius: '14px',
            border: '1px solid var(--tarjeta-borde)',
            padding: '20px',
            boxShadow: 'var(--sombra-tarjeta)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--texto-principal)' }}>
              Órdenes de Compra Recientes
            </h3>
            <Link
              to="/proveedor/pedidos"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--amarillo-primario)',
                textDecoration: 'none',
              }}
            >
              Ver todas →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pedidosRecientes.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'var(--negro-sidebar-hover)',
                  border: '1px solid var(--tarjeta-borde)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--texto-principal)' }}>{p.id}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--texto-secundario)' }}>{p.fecha}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--texto-secundario)', marginTop: '2px', display: 'block' }}>
                    {p.sucursal} · {p.items} ítems
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--texto-principal)' }}>
                    ${p.total.toLocaleString('es-CO')}
                  </div>
                  <span className={`insignia-estado ${insigniaEstado[p.estado] || 'proceso'}`} style={{ marginTop: '4px', display: 'inline-block' }}>
                    {p.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel de Enlaces y Operaciones Rápidas */}
        <div
          style={{
            background: 'var(--tarjeta-blanca)',
            borderRadius: '14px',
            border: '1px solid var(--tarjeta-borde)',
            padding: '20px',
            boxShadow: 'var(--sombra-tarjeta)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 14px 0', color: 'var(--texto-principal)' }}>
              Acciones de Proveedor
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--texto-secundario)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Gestiona rápidamente tus catálogos, despachos pendientes y emite facturas digitales para liquidación de pagos.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link
                to="/proveedor/pedidos"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'var(--negro-sidebar-hover)',
                  border: '1px solid var(--tarjeta-borde)',
                  color: 'var(--texto-principal)',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <span>📦 Revisar órdenes pendientes de despacho</span>
                <span>→</span>
              </Link>

              <Link
                to="/proveedor/productos"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'var(--negro-sidebar-hover)',
                  border: '1px solid var(--tarjeta-borde)',
                  color: 'var(--texto-principal)',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <span>🏷️ Actualizar precios de coste y stock</span>
                <span>→</span>
              </Link>

              <Link
                to="/proveedor/facturas"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'var(--negro-sidebar-hover)',
                  border: '1px solid var(--tarjeta-borde)',
                  color: 'var(--texto-principal)',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <span>🧾 Radicar nueva factura electrónica</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          <div
            style={{
              marginTop: '20px',
              padding: '12px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.02))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '18px' }}>🛡️</span>
            <div>
              <strong style={{ fontSize: '12px', color: '#10B981', display: 'block' }}>
                Convenio Activo con NovaCasa
              </strong>
              <span style={{ fontSize: '11px', color: 'var(--texto-secundario)' }}>
                Plazo de pago pactado: 30 días · Entrega puerta a puerta
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function IconoPedido(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
}
function IconoFactura(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><line x1="16" y1="8" x2="8" y2="8" /><line x1="16" y1="12" x2="8" y2="12" /></svg>;
}
function IconoCaja(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
}
function IconoEstrella(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
}
function IconoEdificio(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="9" y1="22" x2="9" y2="11" /><line x1="15" y1="22" x2="15" y2="11" /></svg>;
}
function IconoCalendario(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
}
