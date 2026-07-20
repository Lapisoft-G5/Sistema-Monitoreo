import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import type { Layer, PathOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';

/** Forma mínima de una feature del GeoJSON de distritos. */
interface DistritoFeature {
  properties?: { distrito?: string } | null;
}
import { Card } from '@shared/ui/card';
import lampaDistritos from '@shared/assets/lampa-distritos.geojson.json';
import type { IUgelDashboardDistrito } from '@sistema-monitoreo/shared-contracts';

/** Normaliza nombres de distrito (mayúsculas, sin tildes) para el match GeoJSON↔BD. */
export const normDistrito = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()
    .trim();

const colorPorCobertura = (pct: number | null): string => {
  if (pct === null) return '#cbd5e1'; // sin datos
  if (pct < 40) return '#ef4444';
  if (pct < 75) return '#f59e0b';
  return '#22c55e';
};

interface LampaMapProps {
  coberturaPorDistrito: IUgelDashboardDistrito[];
  selected?: string | null;
  onSelectDistrito?: (distrito: string | null) => void;
}

export const LampaMap = ({ coberturaPorDistrito, selected, onSelectDistrito }: LampaMapProps) => {
  const porDistrito = new Map(
    coberturaPorDistrito.map((d) => [normDistrito(d.distrito), d]),
  );
  const selNorm = selected ? normDistrito(selected) : null;

  const styleFeature = (feature?: DistritoFeature): PathOptions => {
    const nombre = normDistrito(String(feature?.properties?.distrito ?? ''));
    const data = porDistrito.get(nombre);
    const isSel = selNorm === nombre;
    return {
      fillColor: colorPorCobertura(data ? data.porcentajeCobertura : null),
      fillOpacity: isSel ? 0.85 : 0.55,
      color: isSel ? '#1e293b' : 'white',
      weight: isSel ? 3 : 1,
    };
  };

  const onEach = (feature: DistritoFeature, layer: Layer) => {
    const nombreRaw = String(feature.properties?.distrito ?? '');
    const nombre = normDistrito(nombreRaw);
    const data = porDistrito.get(nombre);
    const cob = data ? `${data.porcentajeCobertura}% (${data.monitoreadas}/${data.totalInstituciones})` : 'sin datos';
    layer.bindTooltip(`<b>${nombreRaw}</b><br/>Cobertura: ${cob}`, { sticky: true });
    layer.on('click', () => {
      onSelectDistrito?.(selNorm === nombre ? null : nombreRaw);
    });
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
        <MapContainer center={[-15.35, -70.5]} zoom={9} style={{ height: '100%', width: '100%', zIndex: 0 }}>
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
        </MapContainer>

        {/* Leyenda */}
        <Card className="absolute bottom-4 left-4 z-[400] p-3 shadow-md bg-card/95 backdrop-blur-sm border-border">
          <h4 className="text-[10px] font-bold text-text-muted mb-2 uppercase tracking-wider">Cobertura</h4>
          <div className="space-y-1.5 text-xs font-medium">
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Alta (≥75%)</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Media (40–74%)</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-destructive" /> Baja (&lt;40%)</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Sin datos</div>
          </div>
        </Card>
      </div>
    </Card>
  );
};
