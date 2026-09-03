import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function ProveedorEmpresa() {
  const context = useOutletContext();
  const [empresa, setEmpresa] = useState(() => {
    try {
      const guardado = localStorage.getItem('novacasa_proveedor_empresa_datos');
      return guardado
        ? JSON.parse(guardado)
        : {
            razonSocial: 'Distribuidora Central de Muebles & Acabados S.A.S.',
            nit: '901.458.789-2',
            contactoPrincipal: 'Carlos Andrés Mendoza',
            cargo: 'Director Comercial de Cuentas Clave',
            correo: 'suministros@distribuidoracentral.com',
            telefono: '+57 (601) 745-8899 / +57 310 445 9922',
            direccionDespacho: 'Zona Industrial Montevideo, Calle 19 # 68D-40, Bogotá D.C.',
            tiempoLeadTime: '24 a 48 horas en ciudades principales',
            banco: 'Bancolombia',
            tipoCuenta: 'Cuenta Corriente',
            numeroCuenta: '089-445892-11',
            titular: 'Distribuidora Central S.A.S.',
          };
    } catch {
      return {};
    }
  });

  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  const handleChange = (campo, valor) => {
    setEmpresa((prev) => ({ ...prev, [campo]: valor }));
  };

  const guardarCambios = (e) => {
    e.preventDefault();
    localStorage.setItem('novacasa_proveedor_empresa_datos', JSON.stringify(empresa));
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 3000);
  };

  return (
    <>
      <div className="crud-encabezado">
        <div className="crud-encabezado-izq">
          <h2>Perfil de Empresa Proveedora</h2>
          <p>
            Información legal, contacto comercial y datos bancarios para pagos de NovaCasa.
          </p>
        </div>
      </div>

      <form onSubmit={guardarCambios}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Tarjeta 1: Información Legal y Corporativa */}
          <div
            style={{
              background: 'var(--tarjeta-blanca)',
              borderRadius: '14px',
              border: '1px solid var(--tarjeta-borde)',
              padding: '24px',
              boxShadow: 'var(--sombra-tarjeta)',
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--texto-principal)' }}>
              🏢 Datos Corporativos y Tributarios
            </h3>

            <div className="grupo-campo">
              <label>Razón Social Oficial *</label>
              <input
                value={empresa.razonSocial}
                onChange={(e) => handleChange('razonSocial', e.target.value)}
                required
              />
            </div>

            <div className="fila-campos">
              <div className="grupo-campo">
                <label>NIT / RUT *</label>
                <input
                  value={empresa.nit}
                  onChange={(e) => handleChange('nit', e.target.value)}
                  required
                />
              </div>
              <div className="grupo-campo">
                <label>Teléfono PBX / Móvil</label>
                <input
                  value={empresa.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                />
              </div>
            </div>

            <div className="grupo-campo">
              <label>Correo Electrónico de Suministro *</label>
              <input
                type="email"
                value={empresa.correo}
                onChange={(e) => handleChange('correo', e.target.value)}
                required
              />
            </div>

            <div className="grupo-campo">
              <label>Dirección del Centro de Despacho / Bodega</label>
              <input
                value={empresa.direccionDespacho}
                onChange={(e) => handleChange('direccionDespacho', e.target.value)}
              />
            </div>
          </div>

          {/* Tarjeta 2: Contacto Comercial y Datos Bancarios */}
          <div
            style={{
              background: 'var(--tarjeta-blanca)',
              borderRadius: '14px',
              border: '1px solid var(--tarjeta-borde)',
              padding: '24px',
              boxShadow: 'var(--sombra-tarjeta)',
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--texto-principal)' }}>
              💳 Datos de Facturación y Cuentas de Pago
            </h3>

            <div className="fila-campos">
              <div className="grupo-campo">
                <label>Representante Comercial</label>
                <input
                  value={empresa.contactoPrincipal}
                  onChange={(e) => handleChange('contactoPrincipal', e.target.value)}
                />
              </div>
              <div className="grupo-campo">
                <label>Cargo del Contacto</label>
                <input
                  value={empresa.cargo}
                  onChange={(e) => handleChange('cargo', e.target.value)}
                />
              </div>
            </div>

            <div className="fila-campos">
              <div className="grupo-campo">
                <label>Entidad Bancaria</label>
                <input
                  value={empresa.banco}
                  onChange={(e) => handleChange('banco', e.target.value)}
                />
              </div>
              <div className="grupo-campo">
                <label>Tipo de Cuenta</label>
                <select
                  value={empresa.tipoCuenta}
                  onChange={(e) => handleChange('tipoCuenta', e.target.value)}
                >
                  <option value="Cuenta Corriente">Cuenta Corriente</option>
                  <option value="Cuenta de Ahorros">Cuenta de Ahorros</option>
                </select>
              </div>
            </div>

            <div className="grupo-campo">
              <label>Número de Cuenta Bancaria</label>
              <input
                value={empresa.numeroCuenta}
                onChange={(e) => handleChange('numeroCuenta', e.target.value)}
              />
            </div>

            <div className="grupo-campo">
              <label>Tiempo Promedio de Alistamiento (Lead Time)</label>
              <input
                value={empresa.tiempoLeadTime}
                onChange={(e) => handleChange('tiempoLeadTime', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button type="submit" className="btn-primario" style={{ padding: '10px 24px' }}>
            Guardar Información de Proveedor
          </button>
          {guardadoExitoso && (
            <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 600 }}>
              ✓ Cambios guardados correctamente
            </span>
          )}
        </div>
      </form>
    </>
  );
}
