import { useUser } from '@entities/model-user';
import { DirectoresPage } from '../jefeArea/DirectoresPage';
import { DocentesPage } from './DocentesPage';
import { DocenteCreatePage as JefeDocenteCreatePage } from '../jefeArea/DocenteCreatePage';
import { DocenteCreatePage as DirectorDocenteCreatePage } from './DocenteCreatePage';
import { DocenteEditPage as JefeDocenteEditPage } from '../jefeArea/DocenteEditPage';
import { DocenteEditPage as DirectorDocenteEditPage } from './DocenteEditPage';
import { DocenteDetailPage as JefeDocenteDetailPage } from '../jefeArea/DocenteDetailPage';
import { DocenteDetailPage as DirectorDocenteDetailPage } from './DocenteDetailPage';
import { CoordinadoresPage } from './CoordinadoresPage';
import { JefesAreaPage } from '../jefeGestion/JefesAreaPage';
import { CoordinadorAssignPage } from './CoordinadorAssignPage';
import { JefeAreaCreatePage } from '../jefeGestion/JefeAreaCreatePage';

export const DocenteListSwitcher = () => {
  const { user } = useUser();
  const isDirector = user?.role === 'director_institucion' || user?.role === 'director_ie';
  return isDirector ? <DocentesPage /> : <DirectoresPage />;
};

export const DocenteCreateSwitcher = () => {
  const { user } = useUser();
  const isDirector = user?.role === 'director_institucion' || user?.role === 'director_ie';
  return isDirector ? <DirectorDocenteCreatePage /> : <JefeDocenteCreatePage />;
};

export const DocenteEditSwitcher = () => {
  const { user } = useUser();
  const isDirector = user?.role === 'director_institucion' || user?.role === 'director_ie';
  return isDirector ? <DirectorDocenteEditPage /> : <JefeDocenteEditPage />;
};

export const DocenteDetailSwitcher = () => {
  const { user } = useUser();
  const isDirector = user?.role === 'director_institucion' || user?.role === 'director_ie';
  return isDirector ? <DirectorDocenteDetailPage /> : <JefeDocenteDetailPage />;
};

export const CoordinadorSwitcher = () => {
  const { user } = useUser();
  const isDirector = user?.role === 'director_institucion' || user?.role === 'director_ie';
  return isDirector ? <CoordinadoresPage /> : <JefesAreaPage />;
};

export const CoordinadorCreateSwitcher = () => {
  const { user } = useUser();
  const isDirector = user?.role === 'director_institucion' || user?.role === 'director_ie';
  return isDirector ? <CoordinadorAssignPage /> : <JefeAreaCreatePage />;
};
