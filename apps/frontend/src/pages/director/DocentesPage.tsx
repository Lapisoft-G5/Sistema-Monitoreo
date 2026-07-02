import { DocenteListPageBase } from './DocenteListPageBase';

export const DocentesPage = () => {
  return (
    <DocenteListPageBase
      title="Gestión de Docentes"
      description="Administración y asignación del personal docente de la institución."
      actionText="Registrar Docente"
      createPath="/instituciones/docentes/nuevo"
      targetCargo="Docente de Aula"
      itemName="docentes"
      loadingLabel="Cargando docentes..."
      filterCargoOut="Director"
    />
  );
};
