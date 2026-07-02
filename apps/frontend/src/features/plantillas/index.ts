export { plantillasApi } from './api/plantillas.api';
export type { CreatePlantillaInput, UpdatePlantillaInput } from './api/plantillas.api';
export {
  usePlantillasList,
  usePlantilla,
  useCrearPlantilla,
  useActualizarPlantilla,
  useCambiarEstadoPlantilla,
  useDuplicarPlantilla,
  useEliminarPlantilla,
  useCountFichasPlantilla,
} from './api/use-plantillas-api';
