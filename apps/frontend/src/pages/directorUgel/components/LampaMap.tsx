import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup } from 'react-leaflet';
import L, { type Layer, type PathOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@shared/ui/card';
import lampaDistritos from '@shared/assets/lampa-distritos.geojson.json';
import type {
  IUgelDashboardDistrito,
  IUgelDashboardIeMapa,
} from '@sistema-monitoreo/shared-contracts';

/** Forma mínima de una feature del GeoJSON de distritos. */
interface DistritoFeature {
  properties?: { distrito?: string } | null;
}

/** Límites geográficos de la provincia de Lampa (para encuadrar y acotar el mapa). */
const LAMPA_BOUNDS = L.geoJSON(lampaDistritos as never).getBounds();

/** Normaliza nombres de distrito (mayúsculas, sin tildes) para el match GeoJSON↔BD. */
export const normDistrito = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()
    .trim();

const ESTADO_UI: Record<string, { color: string; label: string }> = {
  critico: { color: '#ef4444', label: 'Crítico' },
  enProceso: { color: '#f59e0b', label: 'En proceso' },
  logroPrevisto: { color: '#22c55e', label: 'Logro previsto' },
  sinRegistro: { color: '#94a3b8', label: 'Sin registro' },
};

interface LampaMapProps {
  coberturaPorDistrito: IUgelDashboardDistrito[];
  instituciones: IUgelDashboardIeMapa[];
  selected?: string | null;
  onSelectDistrito?: (distrito: string | null) => void;
}

export const LampaMap = ({
  coberturaPorDistrito,
  instituciones,
  selected,
  onSelectDistrito,
}: LampaMapProps) => {
  const porDistrito = new Map(coberturaPorDistrito.map((d) => [normDistrito(d.distrito), d]));
  const selNorm = selected ? normDistrito(selected) : null;
  const marcadores = selNorm
    ? instituciones.filter((ie) => normDistrito(ie.distrito) === selNorm)
    : instituciones;

  const styleFeature = (feature?: DistritoFeature): PathOptions => {
    const isSel = selNorm === normDistrito(String(feature?.properties?.distrito ?? ''));
    return {
      fillColor: isSel ? '#6366f1' : '#cbd5e1',
      fillOpacity: isSel ? 0.25 : 0.15,
      color: isSel ? '#4338ca' : '#94a3b8',
      weight: isSel ? 2.5 : 1,
    };
  };

  const onEach = (feature: DistritoFeature, layer: Layer) => {
    const nombreRaw = String(feature.properties?.distrito ?? '');
    const nombre = normDistrito(nombreRaw);
    const data = porDistrito.get(nombre);
    const cob = data
      ? `${data.porcentajeCobertura}% (${data.monitoreadas}/${data.totalInstituciones})`
      : 'sin datos';
    layer.bindTooltip(`<b>${nombreRaw}</b><br/>Cobertura: ${cob}`, { sticky: true });
    layer.on('click', () => onSelectDistrito?.(selNorm === nombre ? null : nombreRaw));
  };

  return (
    <Card className="h-full flex flex-col relative overflow-hidden border-border shadow-xs">
      <div className="p-4 flex justify-between items-center border-b border-border bg-card z-10">
        <h3 className="text-lg font-bold">Mapa Georreferencial - Lampa</h3>
        {selected ? (
          <span
            className="text-xs font-bold text-primary cursor-pointer hover:underline"
            onClick={() => onSelectDistrito?.(null)}
          >
            {selected} ✕
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            clic en un distrito para filtrar
          </span>
        )}
      </div>

      <div className="flex-1 w-full bg-muted/20 relative z-0 h-[400px] md:h-auto">
        <MapContainer
          bounds={LAMPA_BOUNDS}
          maxBounds={LAMPA_BOUNDS.pad(0.15)}
          maxBoundsViscosity={1}
          minZoom={9}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <GeoJSON
            key={selNorm ?? 'none'}
            data={lampaDistritos as never}
            style={styleFeature as never}
            onEachFeature={onEach}
          />
          {marcadores.map((ie) => {
            const ui = ESTADO_UI[ie.estado] ?? ESTADO_UI.sinRegistro;
            return (
              <CircleMarker
                key={ie.institucionId}
                center={[ie.latitud, ie.longitud]}
                radius={4}
                pathOptions={{ fillColor: ui.color, fillOpacity: 0.95, color: 'white', weight: 1 }}
              >
                <Popup>
                  <div className="text-xs">
                    <div className="font-bold">{ie.nombre}</div>
                    <div className="text-text-muted">{ie.distrito}</div>
                    <div style={{ color: ui.color }} className="font-semibold">
                      {ui.label}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Leyenda: estado de monitoreo por IE */}
        <Card className="absolute bottom-4 left-4 z-[400] p-3 shadow-md bg-card/95 backdrop-blur-sm border-border">
          <h4 className="text-[10px] font-bold text-text-muted mb-2 uppercase tracking-wider">
            Estado de monitoreo
          </h4>
          <div className="space-y-1.5 text-xs font-medium">
            {Object.values(ESTADO_UI).map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Card>
  );
};
