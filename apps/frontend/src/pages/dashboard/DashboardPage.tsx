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

// Colores semáforo: estos vienen de datos dinámicos, se usan inline inevitablemente
const ESTADO_COLOR: Record<string, string> = {
  SATISFACTORIO: '#10b981',
  'EN PROCESO': '#f59e0b',
  CRÍTICO: '#ef4444',
};

const total = EVALUATIONS.reduce((s, e) => s + e.count, 0);

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="bg-bg min-h-screen p-6 flex flex-col gap-6 text-text">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text m-0">Panel de Control</h1>
        </div>
        <div className="text-text-muted text-sm">
          Bienvenido,{' '}
          <strong className="text-text">
            {user?.nombres ?? 'Usuario'} {user?.apellidos ?? 'Especialista'}
          </strong>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <div
            key={i}
            className={`rounded-xl p-5 ${
              s.accent
                ? 'bg-primary text-white'
                : 'bg-surface border border-border shadow-sm text-text'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  s.accent ? 'text-white/80' : 'text-text-muted'
                }`}
              >
                {s.label}
              </span>
              {s.trend && (
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {s.trend}
                </span>
              )}
            </div>
            <span className="text-3xl font-bold leading-none">{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── Fila central ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.5fr] gap-5 items-start">
        {/* Estado de Evaluación */}
        <div className="bg-surface border border-border shadow-sm rounded-xl p-5">
          <h3 className="text-base font-bold text-text mb-4">Estado de Evaluación</h3>

          <div className="flex flex-col gap-3 mb-5">
            {EVALUATIONS.map((ev, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3.5 py-3 rounded-lg bg-bg border border-border"
              >
                <span className="text-2xl font-bold min-w-[40px] text-text">{ev.count}</span>
                <div className="flex-1">
                  <p className="text-text-muted text-sm font-medium m-0">{ev.label}</p>
                  {/* barra proporcional — color dinámico, inline inevitable */}
                  <div className="mt-1.5 h-1 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(ev.count / total) * 100}%`,
                        background: ev.color,
                      }}
                    />
                  </div>
                </div>
                {/* badge de color semáforo — inline inevitable */}
                <span
                  className="text-[0.65rem] font-bold px-3 py-0.5 rounded-full text-white"
                  style={{ background: ev.color }}
                >
                  {ev.badge}
                </span>
              </div>
            ))}
          </div>

          {/* Cobertura */}
          <div className="pt-4 border-t border-border">
            <div className="flex justify-between text-xs text-text-muted font-medium mb-2">
              <span>Resumen de Cobertura</span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden relative">
              <div className="h-full w-[23.8%] bg-success rounded-full" />
            </div>
            <div className="flex justify-between text-xs text-text-dim mt-1.5">
              <span>META 2024: 100%</span>
              <span>ACTUAL: 23.8%</span>
            </div>
          </div>
        </div>

        {/* Mapa Georeferencial */}
        <div className="bg-surface border border-border shadow-sm rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-text m-0">Mapa Georeferencial — Lampa</h3>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border text-text-muted text-xs rounded-lg cursor-pointer hover:bg-bg transition-colors font-medium">
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
          <div className="h-[280px] bg-bg rounded-lg border border-border overflow-hidden">
            <svg viewBox="0 0 340 280" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
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

              <circle cx="178" cy="128" r="5" fill="#ef4444" stroke="#fff" strokeWidth="1" />
              <circle cx="272" cy="118" r="5" fill="#990537" stroke="#fff" strokeWidth="1" />
              <circle cx="158" cy="190" r="5" fill="#e65100" stroke="#fff" strokeWidth="1" />
              <circle cx="248" cy="185" r="5" fill="#22c55e" stroke="#fff" strokeWidth="1" />
              <circle cx="137" cy="228" r="5" fill="#e65100" stroke="#fff" strokeWidth="1" />

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
                  ['#f59e0b', 'En Seguimiento', 16, 243],
                  ['#ef4444', 'Crítico', 16, 258],
                  ['#cbd5e1', 'Sin Registro', 16, 271],
                ] as [string, string, number, number][]
              ).map(([c, t, x, y], i) => (
                <g key={i}>
                  <circle cx={x - 6} cy={y - 3} r="3" fill={c} />
                  <text x={x} y={y} fill="#1e293b" fontSize="7.5" fontWeight="500">
                    {t}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* ── Tabla monitoreos recientes ── */}
      <div className="bg-surface border border-border shadow-sm rounded-xl p-5">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-bold text-text m-0">Monitoreos Recientes</h3>
          <button className="text-primary text-sm font-semibold bg-transparent border-none cursor-pointer hover:text-primary-hover transition-colors">
            Ver reporte detallado →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
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
                    className="text-left text-[0.72rem] font-bold uppercase tracking-wide text-text-muted px-4 pb-3 border-b-2 border-bg"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MONITOREOS.map((m, i) => (
                <tr key={i} className={i % 2 !== 0 ? 'bg-bg' : ''}>
                  <td className="px-4 py-3.5 border-b border-bg">
                    <p className="text-sm font-semibold text-text m-0">{m.ie}</p>
                    <p className="text-text-muted text-xs m-0 mt-0.5">Cód. Modular: {m.cod}</p>
                  </td>
                  <td className="px-4 py-3.5 border-b border-bg">
                    <p className="text-sm text-text m-0">{m.nivel}</p>
                    <p className="text-text-muted text-xs m-0 mt-0.5 uppercase">{m.dist}</p>
                  </td>
                  <td className="px-4 py-3.5 border-b border-bg">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {m.esp[0]}
                        {m.esp.split(' ')[1]?.[0]}
                      </div>
                      <span className="text-sm text-text">{m.esp}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 border-b border-bg text-text-muted text-sm">
                    {m.fecha}
                  </td>
                  <td className="px-4 py-3.5 border-b border-bg">
                    {/* color semáforo dinámico — inline inevitable aquí */}
                    <span
                      className="text-[0.72rem] font-bold px-3 py-1 rounded-md whitespace-nowrap"
                      style={{
                        color: ESTADO_COLOR[m.estado],
                        background: `${ESTADO_COLOR[m.estado]}18`,
                        border: `1px solid ${ESTADO_COLOR[m.estado]}35`,
                      }}
                    >
                      {m.logro.toFixed(1)} — {m.estado}
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
