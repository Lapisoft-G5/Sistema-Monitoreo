import { useUser } from '@entities/model-user';
import { DirectoresPage } from '../jefeArea/DirectoresPage';
import { DocentesPage } from './DocentesPage';
import { DocenteCreatePage as JefeDocenteCreatePage } from '../jefeArea/DocenteCreatePage';
import { DocenteCreatePage as DirectorDocenteCreatePage } from './DocenteCreatePage';
import { DocenteEditPage as JefeDocenteEditPage } from '../jefeArea/DocenteEditPage';
import { DocenteEditPage as DirectorDocenteEditPage } from './DocenteEditPage';
import { DocenteDetailPage as JefeDocenteDetailPage } from '../jefeArea/DocenteDetailPage';
import { DocenteDetailPage as DirectorDocenteDetailPage } from './DocenteDetailPage';

export const DocenteListSwitcher = () => {
  const { user } = useUser();
  return user?.role === 'director_institucion' ? <DocentesPage /> : <DirectoresPage />;
};

export const DocenteCreateSwitcher = () => {
  const { user } = useUser();
  return user?.role === 'director_institucion' ? <DirectorDocenteCreatePage /> : <JefeDocenteCreatePage />;
};

export const DocenteEditSwitcher = () => {
  const { user } = useUser();
  return user?.role === 'director_institucion' ? <DirectorDocenteEditPage /> : <JefeDocenteEditPage />;
};

export const DocenteDetailSwitcher = () => {
  const { user } = useUser();
  return user?.role === 'director_institucion' ? <DirectorDocenteDetailPage /> : <JefeDocenteDetailPage />;
};
