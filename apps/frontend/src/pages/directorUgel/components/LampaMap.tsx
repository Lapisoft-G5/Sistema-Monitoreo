import { MapContainer, TileLayer, Popup, CircleMarker, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@shared/ui/card';
import lampaGeoJSON from '@shared/assets/lampa.geojson.json';

export const LampaMap = () => {
  // Mock data of schools in Lampa
  const mockSchools = [
    { id: 1, name: 'IE 70001 Huayta', lat: -15.3615, lng: -70.3662, status: 'success' },
    { id: 2, name: 'IE 71011 Pucará', lat: -15.0500, lng: -70.3800, status: 'warning' },
    { id: 3, name: 'IE Inicial 115', lat: -15.3800, lng: -70.3500, status: 'destructive' },
    { id: 4, name: 'IE Ocuviri', lat: -15.1800, lng: -70.8500, status: 'warning' },
    { id: 5, name: 'IE Paratía', lat: -15.4500, lng: -70.6000, status: 'success' },
    { id: 6, name: 'IE Santa Lucía', lat: -15.7000, lng: -70.6000, status: 'warning' },
    { id: 7, name: 'IE Cabanilla', lat: -15.6000, lng: -70.3500, status: 'success' },
    { id: 8, name: 'IE Nicasio', lat: -15.2500, lng: -70.2500, status: 'success' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#22c55e';
      case 'warning': return '#f59e0b';
      case 'destructive': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  return (
    <Card className="h-full flex flex-col relative overflow-hidden border-border shadow-xs">
      <div className="p-4 flex justify-between items-center border-b border-border bg-card z-10">
        <h3 className="text-lg font-bold">Mapa Georeferencial - Lampa</h3>
        <span className="text-xs font-bold text-primary cursor-pointer hover:underline flex items-center gap-1 uppercase tracking-wider">
           Filtro Avanzado
        </span>
      </div>
      
      <div className="flex-1 w-full bg-muted/20 relative z-0 h-[400px] md:h-auto">
        <MapContainer 
          center={[-15.3615, -70.3662]} 
          zoom={9} 
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {/* Highlight Lampa boundary */}
          <GeoJSON 
            data={lampaGeoJSON as any} 
            style={{ color: '#e11d48', weight: 2, fillOpacity: 0.05, dashArray: '5, 5' }} 
          />
          {mockSchools.map((school) => (
            <CircleMarker
              key={school.id}
              center={[school.lat, school.lng]}
              radius={7}
              pathOptions={{
                fillColor: getStatusColor(school.status),
                fillOpacity: 1,
                color: 'white',
                weight: 2
              }}
            >
              <Popup>
                <div className="font-semibold text-sm">{school.name}</div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Legend Overlay */}
        <Card className="absolute bottom-4 left-4 z-[400] p-3 shadow-md bg-card/95 backdrop-blur-sm border-border">
          <h4 className="text-[10px] font-bold text-text-muted mb-2 uppercase tracking-wider">Estado de Monitoreo</h4>
          <div className="space-y-1.5 text-xs font-medium">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div> SATISFACTORIO</div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> EN PROCESO</div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-destructive"></div> CRÍTICO</div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30"></div> SIN REGISTRO</div>
          </div>
        </Card>
      </div>
    </Card>
  );
};
