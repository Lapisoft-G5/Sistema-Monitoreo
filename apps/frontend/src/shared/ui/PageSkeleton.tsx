/**
 * Skeleton de carga que se muestra mientras React.lazy() descarga el chunk.
 * Mantiene la misma estructura visual que el contenido real para evitar
 * saltos de layout (CLS).
 */
export const PageSkeleton = () => (
  <div className="p-6 flex flex-col gap-5 animate-pulse">
    {/* Encabezado */}
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-col gap-2">
        <div className="h-6 w-40 bg-border rounded-lg" />
        <div className="h-4 w-64 bg-border rounded-md" />
      </div>
      <div className="h-10 w-36 bg-border rounded-xl" />
    </div>

    {/* KPIs */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-surface border border-border rounded-2xl px-5 py-4 h-24" />
      ))}
    </div>

    {/* Barra de búsqueda */}
    <div className="h-11 bg-surface border border-border rounded-xl" />

    {/* Tabla */}
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="h-11 bg-bg border-b border-border" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-14 border-b border-border last:border-0 mx-4 flex items-center">
          <div className="h-4 w-full bg-border rounded-md opacity-50" />
        </div>
      ))}
    </div>
  </div>
);
