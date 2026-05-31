import { useAuth } from '../../features/authentication/useAuth';

const STATS = [
  { label: 'Total II.EE.', value: '503', trend: null, accent: false },
  { label: 'Monitoreadas', value: '120', trend: '▲ 23.8%', accent: false },
  { label: 'Rendimiento', value: '383', trend: null, accent: false },
  { label: 'Nivel Rendimiento', value: '2.8 / 4.0', trend: null, accent: true },
];

const EVALUATIONS = [
  { count: 15, label: 'Situación Crítica', color: '#ef4444', badge: 'ROJO' },
  { count: 45, label: 'En Seguimiento', color: '#f97316', badge: 'NARANJA' },
  { count: 60, label: 'Logro Previsto', color: '#22c55e', badge: 'VERDE' },
];

const MONITOREOS = [
  {
    ie: 'IE 70001 Huayta',
    cod: '0234567',
    nivel: 'Primaria',
    dist: 'LAMPA',
    esp: 'Juan Pérez',
    fecha: '12/10/2023',
    logro: 3.5,
    estado: 'SATISFACTORIO',
  },
  {
    ie: 'IE 71011 Pucará',
    cod: '0234989',
    nivel: 'Secundaria',
    dist: 'PUCARÁ',
    esp: 'María Gómez',
    fecha: '11/10/2023',
    logro: 2.2,
    estado: 'EN PROCESO',
  },
  {
    ie: 'IE Inicial 115 Lampa',
    cod: '0234123',
    nivel: 'Inicial',
    dist: 'LAMPA',
    esp: 'Carlos Ruiz',
    fecha: '10/10/2023',
    logro: 1.2,
    estado: 'CRÍTICO',
  },
  {
    ie: 'IE 70005 Santa Lucía',
    cod: '0234456',
    nivel: 'Primaria',
    dist: 'SANTA LUCÍA',
    esp: 'Ana Torres',
    fecha: '09/10/2023',
    logro: 3.8,
    estado: 'SATISFACTORIO',
  },
  {
    ie: 'IE 71012 Cabanilla',
    cod: '0234777',
    nivel: 'Secundaria',
    dist: 'CABANILLA',
    esp: 'Roberto Inca',
    fecha: '08/10/2023',
    logro: 2.8,
    estado: 'EN PROCESO',
  },
];

const ESTADO_COLOR: Record<string, string> = {
  SATISFACTORIO: '#22c55e',
  'EN PROCESO': '#f97316',
  CRÍTICO: '#ef4444',
};

// Paleta Light Mode basada exactamente en tu mockup
const bgApp = '#f8fafc';
const cardBg = '#ffffff';
const textPrimary = '#1e293b';
const textSecondary = '#64748b';
const accentBlue = '#0046c7';
const cardShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)';
const borderLight = '1px solid #e2e8f0';

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div
      style={{
        background: bgApp,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        color: textPrimary,
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: textPrimary }}>
            Panel de Control
          </h1>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: textSecondary,
            fontSize: '0.87rem',
          }}
        >
          <span>
            Bienvenido,{' '}
            <strong>
              {user?.nombres || 'Usuario'} {user?.apellidos || 'Especialista'}
            </strong>
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {STATS.map((s, i) => (
          <div
            key={i}
            style={{
              borderRadius: 12,
              padding: '20px',
              boxShadow: s.accent ? 'none' : cardShadow,
              border: s.accent ? 'none' : borderLight,
              background: s.accent ? accentBlue : cardBg,
              color: s.accent ? '#ffffff' : textPrimary,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: s.accent ? 'rgba(255,255,255,0.8)' : textSecondary,
                }}
              >
                {s.label}
              </span>
              {s.trend && (
                <span
                  style={{
                    background: '#e6f4ea',
                    color: '#137333',
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: 20,
                    fontWeight: 600,
                  }}
                >
                  {s.trend}
                </span>
              )}
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20, alignItems: 'start' }}
      >
        {/* Estado evaluación */}
        <div
          style={{
            background: cardBg,
            border: borderLight,
            boxShadow: cardShadow,
            borderRadius: 12,
            padding: 20,
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px', color: textPrimary }}>
            Estado de Evaluación
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {EVALUATIONS.map((ev, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 8,
                  background: '#f8fafc',
                  border: borderLight,
                }}
              >
                <span
                  style={{ fontSize: '1.5rem', fontWeight: 700, minWidth: 40, color: textPrimary }}
                >
                  {ev.count}
                </span>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      color: textSecondary,
                      fontSize: '0.85rem',
                      margin: '0 0 4px',
                      fontWeight: 500,
                    }}
                  >
                    {ev.label}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '3px 12px',
                    borderRadius: 20,
                    background: ev.color,
                    color: '#ffffff',
                  }}
                >
                  {ev.badge}
                </span>
              </div>
            ))}
          </div>

          {/* Cobertura */}
          <div style={{ paddingTop: 16, borderTop: borderLight }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: textSecondary,
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              <span>Resumen de Cobertura</span>
            </div>
            <div
              style={{
                height: 8,
                background: '#e2e8f0',
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: '23.8%',
                  background: '#22c55e',
                  borderRadius: 4,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '23.8%',
                  top: 0,
                  height: '100%',
                  width: '50%',
                  background: '#f97316',
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: textSecondary,
                marginTop: 6,
              }}
            >
              <span>META 2024: 100%</span>
              <span>ACTUAL: 23.8%</span>
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div
          style={{
            background: cardBg,
            border: borderLight,
            boxShadow: cardShadow,
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: textPrimary }}>
              Mapa Georeferencial - Lampa
            </h3>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                background: '#ffffff',
                border: borderLight,
                color: textSecondary,
                fontSize: '0.75rem',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filtrar
            </button>
          </div>
          <div
            style={{
              height: 280,
              background: '#f8fafc',
              borderRadius: 8,
              border: borderLight,
              overflow: 'hidden',
            }}
          >
            <svg
              viewBox="0 0 340 280"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '100%', height: '100%' }}
            >
              {/* Distritos con colores pasteles/vivos idénticos a la imagen */}
              <path
                d="M80 40 L140 30 L160 60 L130 90 L90 80 Z"
                fill="#4dd0e1"
                stroke="#fff"
                strokeWidth="1.5"
              />
              <path
                d="M140 30 L200 20 L230 50 L210 80 L160 60 Z"
                fill="#f06292"
                stroke="#fff"
                strokeWidth="1.5"
              />
              <path
                d="M200 20 L270 30 L280 70 L240 80 L210 80 L230 50 Z"
                fill="#7986cb"
                stroke="#fff"
                strokeWidth="1.5"
              />
              <path
                d="M80 80 L130 90 L160 60 L210 80 L240 80 L250 130 L200 150 L140 140 L100 120 Z"
                fill="#d4e157"
                stroke="#fff"
                strokeWidth="1.5"
              />
              <path
                d="M240 80 L280 70 L310 100 L300 140 L250 130 Z"
                fill="#aed581"
                stroke="#fff"
                strokeWidth="1.5"
              />
              <path
                d="M100 120 L140 140 L200 150 L220 190 L180 210 L120 190 L90 160 Z"
                fill="#bcaaa4"
                stroke="#fff"
                strokeWidth="1.5"
              />
              <path
                d="M200 150 L250 130 L300 140 L290 200 L240 210 L220 190 Z"
                fill="#f48fb1"
                stroke="#fff"
                strokeWidth="1.5"
              />
              <path
                d="M120 190 L180 210 L170 250 L110 240 Z"
                fill="#ffb74d"
                stroke="#fff"
                strokeWidth="1.5"
              />

              {/* Textos de Distritos */}
              {(
                [
                  [105, 60, 'Ocuviri'],
                  [175, 48, 'Vilavila'],
                  [245, 48, 'Nicasio'],
                  [170, 115, 'Palca'],
                  [272, 108, 'Lampa'],
                  [158, 175, 'Paratia'],
                  [250, 175, 'Cabanilla'],
                  [140, 222, 'Sta. Lucía'],
                ] as [number, number, string][]
              ).map(([x, y, l], i) => (
                <text
                  key={i}
                  x={x}
                  y={y}
                  fill="#2c3e50"
                  fontSize="8"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {l}
                </text>
              ))}

              {/* Indicadores Georeferenciales (Puntos del Mockup) */}
              <circle cx="178" cy="128" r="5" fill="#ef4444" stroke="#fff" strokeWidth="1" />
              <circle cx="272" cy="118" r="5" fill="#0046c7" stroke="#fff" strokeWidth="1" />
              <circle cx="158" cy="190" r="5" fill="#e65100" stroke="#fff" strokeWidth="1" />
              <circle cx="248" cy="185" r="5" fill="#22c55e" stroke="#fff" strokeWidth="1" />
              <circle cx="137" cy="228" r="5" fill="#e65100" stroke="#fff" strokeWidth="1" />

              {/* Nueva Leyenda Flotante Clara */}
              <rect
                x="8"
                y="215"
                width="135"
                height="60"
                rx="6"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              {(
                [
                  ['#22c55e', 'Satisfactorio', 16, 228],
                  ['#f97316', 'En Seguimiento', 16, 243],
                  ['#ef4444', 'Crítico', 16, 258],
                  ['#cbd5e1', 'Sin Registro', 16, 271],
                ] as [string, string, number, number][]
              ).map(([c, t, x, y], i) => (
                <g key={i}>
                  <circle cx={x - 6} cy={y - 3} r="3" fill={c} />
                  <text x={x} y={y} fill={textPrimary} fontSize="7.5" fontWeight="500">
                    {t}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Tabla monitoreos recientes */}
      <div
        style={{
          background: cardBg,
          border: borderLight,
          boxShadow: cardShadow,
          borderRadius: 12,
          padding: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: textPrimary }}>
            Monitoreos Recientes
          </h3>
          <button
            style={{
              color: accentBlue,
              fontSize: '0.85rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Ver reporte detallado →
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {[
                  'Institución Educativa',
                  'Nivel / Distrito',
                  'Especialista Responsable',
                  'Fecha Visita',
                  'Estado Logro',
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: textSecondary,
                      padding: '0 16px 12px',
                      borderBottom: '2px solid #f1f5f9',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MONITOREOS.map((m, i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : '#f8fafc' }}>
                  <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <p
                      style={{
                        fontSize: '0.87rem',
                        fontWeight: 600,
                        margin: 0,
                        color: textPrimary,
                      }}
                    >
                      {m.ie}
                    </p>
                    <p style={{ color: textSecondary, fontSize: '0.75rem', margin: '2px 0 0' }}>
                      Cód. Modular: {m.cod}
                    </p>
                  </td>
                  <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '0.85rem', margin: 0, color: textPrimary }}>{m.nivel}</p>
                    <p
                      style={{
                        color: textSecondary,
                        fontSize: '0.75rem',
                        margin: '2px 0 0',
                        textTransform: 'uppercase',
                      }}
                    >
                      {m.dist}
                    </p>
                  </td>
                  <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: '#e0e7ff',
                          color: '#4338ca',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {m.esp[0]}
                        {m.esp.split(' ')[1]?.[0]}
                      </div>
                      <span style={{ fontSize: '0.85rem', color: textPrimary }}>{m.esp}</span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      color: textSecondary,
                      fontSize: '0.85rem',
                    }}
                  >
                    {m.fecha}
                  </td>
                  <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '4px 12px',
                        borderRadius: 6,
                        whiteSpace: 'nowrap',
                        color: ESTADO_COLOR[m.estado],
                        background: `${ESTADO_COLOR[m.estado]}15`,
                        border: `1px solid ${ESTADO_COLOR[m.estado]}30`,
                      }}
                    >
                      {m.logro.toFixed(1)} - {m.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
