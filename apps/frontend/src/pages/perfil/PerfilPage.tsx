import { useState, useEffect, useRef, useId, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User as UserIcon,
  Briefcase,
  Mail,
  Phone,
  Edit,
  Check,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@entities/model-user';
import { authApi } from '@/shared/api/auth.api';
import { ROLE_LABELS, type IPerfilResponse } from '@sistema-monitoreo/shared-contracts';
import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/card';
import { Button } from '@shared/ui/button';
import { Badge } from '@shared/ui/badge';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { cn } from '@shared/lib/utils';

export const PerfilPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const [perfil, setPerfil] = useState<IPerfilResponse | null>(null);
  const [correo, setCorreo] = useState(() => user?.correo ?? '');
  const [celular, setCelular] = useState(() => user?.telefono ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ correo?: string; celular?: string }>({});

  const dniId = useId();
  const nombresId = useId();
  const apellidosId = useId();
  const correoId = useId();
  const celularId = useId();

  useEffect(() => {
    let isMounted = true;

    authApi
      .getPerfil()
      .then((res) => {
        if (isMounted && res.ok && res.data) {
          setPerfil(res.data);
          const fetchedCorreo = res.data.correo ?? '';
          const fetchedCelular = res.data.telefono ?? '';
          setCorreo(fetchedCorreo);
          setCelular(fetchedCelular);

          if (userRef.current) {
            setUser({
              ...userRef.current,
              correo: res.data.correo ?? null,
              telefono: res.data.telefono ?? null,
            });
          }
        }
      })
      .catch((err) => {
        console.error('Error al cargar datos de perfil:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [setUser]);

  const handleStartEdit = () => {
    setCorreo(perfil?.correo ?? user?.correo ?? '');
    setCelular(perfil?.telefono ?? user?.telefono ?? '');
    setErrors({});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setCorreo(perfil?.correo ?? '');
    setCelular(perfil?.telefono ?? '');
    setErrors({});
    setIsEditing(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors: { correo?: string; celular?: string } = {};

    const cleanCorreo = correo.trim();
    const cleanCelular = celular.trim();

    if (cleanCorreo) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanCorreo)) {
        newErrors.correo = 'El formato del correo electrónico no es válido';
      }
    }

    if (cleanCelular) {
      const phoneRegex = /^9\d{8}$/;
      if (!phoneRegex.test(cleanCelular)) {
        newErrors.celular = 'El celular debe tener 9 dígitos y comenzar con 9';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const res = await authApi.updatePerfil({
        correo: cleanCorreo || null,
        telefono: cleanCelular || null,
      });

      if (!res.ok) {
        const errorMsg =
          (res.error as { message?: string })?.message ||
          'No se pudo actualizar el perfil. Intente nuevamente.';
        toast.error(errorMsg);
        return;
      }

      if (res.data) {
        setPerfil(res.data);
        setCorreo(res.data.correo ?? '');
        setCelular(res.data.telefono ?? '');
      }

      if (user) {
        setUser({
          ...user,
          correo: res.data?.correo ?? null,
          telefono: res.data?.telefono ?? null,
        });
      }

      setIsEditing(false);
      toast.success('Perfil actualizado correctamente');
    } catch (err) {
      console.error('Fallo al actualizar perfil:', err);
      toast.error('Error de conexión al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col justify-center items-center gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
        <span className="text-text-muted text-sm font-medium">Cargando ficha de perfil...</span>
      </div>
    );
  }

  const apellidos = perfil?.apellidos || user?.apellidos || '';
  const nombres = perfil?.nombres || user?.nombres || '';
  const dni = perfil?.dni || user?.dni || '';
  const correoActual = perfil?.correo ?? user?.correo ?? null;
  const telefonoActual = perfil?.telefono ?? user?.telefono ?? null;
  const cargoActual =
    perfil?.cargo || (user?.role ? ROLE_LABELS[user.role] : 'Usuario del Sistema');
  const institucionActual = perfil?.institucion || 'Sede UGEL Lampa';
  const condicionActual = perfil?.condicion || 'Nombrado';
  const escalaActual = perfil?.escala ? `Escala ${perfil.escala}` : 'Escala no registrada';
  const nivelEducativoActual = perfil?.nivelEducativo || 'UGEL';

  return (
    <div className="flex flex-col gap-6 max-w-[840px] mx-auto w-full animate-in fade-in-0 duration-300">
      {/* VISTA 1: FICHA INFORMATIVA COMPLETA (MODO LECTURA) */}
      {!isEditing ? (
        <>
          {/* Cabecera de la Ficha */}
          <div className="flex items-center justify-between gap-3 flex-wrap bg-surface p-4 border border-border rounded-2xl shadow-xs">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 rounded-xl bg-bg border border-border text-text-muted hover:text-text hover:bg-muted transition-colors cursor-pointer"
                aria-label="Regresar"
              >
                <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-text m-0 leading-tight">Mi Perfil</h1>
                <p className="text-text-muted text-[0.8rem] m-0">Detalle laboral y de contacto</p>
              </div>
            </div>

            <Button
              onClick={handleStartEdit}
              className="flex items-center gap-2 font-bold cursor-pointer bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-xl shadow-xs"
            >
              <Edit className="h-[16px] w-[16px]" />
              <span>Editar Ficha</span>
            </Button>
          </div>

          {/* Ficha Completa en 2 Columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tarjeta 1: Información Personal */}
            <Card className="p-6 border border-border shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <UserIcon className="w-5 h-5 text-primary" strokeWidth={2.2} />
                <h3 className="text-sm font-bold text-text">Información Personal</h3>
              </div>
              <div className="flex flex-col gap-3.5">
                <div>
                  <span className="text-[0.68rem] text-text-muted uppercase font-bold tracking-wider block">
                    Apellidos y Nombres
                  </span>
                  <span className="text-base font-bold text-text uppercase">
                    {apellidos}, {nombres}
                  </span>
                </div>
                <div>
                  <span className="text-[0.68rem] text-text-muted uppercase font-bold tracking-wider block">
                    DNI
                  </span>
                  <span className="text-sm font-semibold text-text">{dni}</span>
                </div>
                <div className="flex items-center gap-3 bg-muted/20 p-2.5 rounded-xl border border-border/40">
                  <Mail className="w-4.5 h-4.5 text-text-muted shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[0.65rem] text-text-muted uppercase font-bold tracking-wider">
                      Correo UGEL / I.E.
                    </span>
                    <span className="text-xs font-semibold text-text truncate">
                      {correoActual || 'No registrado'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-muted/20 p-2.5 rounded-xl border border-border/40">
                  <Phone className="w-4.5 h-4.5 text-text-muted shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[0.65rem] text-text-muted uppercase font-bold tracking-wider">
                      Teléfono de Contacto
                    </span>
                    <span className="text-xs font-semibold text-text truncate">
                      {telefonoActual || 'No registrado'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tarjeta 2: Situación Laboral Base */}
            <Card className="p-6 border border-border shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Briefcase className="w-5 h-5 text-primary" strokeWidth={2.2} />
                <h3 className="text-sm font-bold text-text">Situación Laboral Base</h3>
              </div>
              <div className="flex flex-col gap-3.5">
                <div>
                  <span className="text-[0.68rem] text-text-muted uppercase font-bold tracking-wider block mb-1">
                    Cargo Desempeñado
                  </span>
                  <Badge
                    variant="default"
                    className="text-xs font-bold px-3 py-0.5 uppercase tracking-wide bg-primary text-white"
                  >
                    {cargoActual}
                  </Badge>
                </div>
                <div>
                  <span className="text-[0.68rem] text-text-muted uppercase font-bold tracking-wider block">
                    Institución Vinculada (I.E.)
                  </span>
                  <span className="text-sm font-semibold text-text">{institucionActual}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[0.68rem] text-text-muted uppercase font-bold tracking-wider block">
                      Condición
                    </span>
                    <span className="text-xs font-bold text-text">{condicionActual}</span>
                  </div>
                  <div>
                    <span className="text-[0.68rem] text-text-muted uppercase font-bold tracking-wider block">
                      Escala Magisterial
                    </span>
                    <span className="text-xs font-bold text-text">{escalaActual}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[0.68rem] text-text-muted uppercase font-bold tracking-wider block">
                    Nivel Educativo
                  </span>
                  <span className="text-xs font-semibold text-text uppercase">
                    {nivelEducativoActual}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </>
      ) : (
        /* VISTA 2: EDICIÓN DE CONTACTO (TELÉFONO Y CORREO) */
        <div className="flex flex-col gap-6 animate-in fade-in-0 duration-200">
          {/* Cabecera de Edición */}
          <div className="flex items-center justify-between gap-3 flex-wrap bg-surface p-4 border border-border rounded-2xl shadow-xs">
            <div className="flex items-center gap-3.5">
              <button
                onClick={handleCancel}
                className="p-2.5 rounded-xl bg-bg border border-border text-text-muted hover:text-text hover:bg-muted transition-colors cursor-pointer"
                aria-label="Cancelar edición"
              >
                <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-text m-0 leading-tight">
                  Editar Información de Contacto
                </h1>
                <p className="text-text-muted text-[0.8rem] m-0">
                  Actualice su correo y número de celular. Su DNI y nombres son inmutables.
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-[0.72rem] font-medium px-2.5 py-1"
            >
              Modo Edición
            </Badge>
          </div>

          {/* Formulario de Edición */}
          <Card className="border border-border shadow-xs overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-6 space-y-0 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <span className="text-primary flex items-center justify-center">
                  <UserIcon className="w-5 h-5" strokeWidth={2.2} />
                </span>
                <CardTitle className="text-base font-bold text-text">Datos Personales</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Fila 1: DNI, Nombres, Apellidos (Inmutables) */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* DNI */}
                  <div className="md:col-span-1">
                    <Label htmlFor={dniId} className="text-xs font-semibold text-text mb-1.5 block">
                      DNI <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id={dniId}
                        type="text"
                        value={dni}
                        disabled
                        readOnly
                        className="w-full rounded-lg text-sm bg-muted/60 font-medium text-text border-border pr-8 cursor-not-allowed opacity-90"
                      />
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Check className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>

                  {/* Nombres */}
                  <div className="md:col-span-2">
                    <Label
                      htmlFor={nombresId}
                      className="text-xs font-semibold text-text mb-1.5 block"
                    >
                      Nombres <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={nombresId}
                      type="text"
                      value={nombres}
                      disabled
                      readOnly
                      className="w-full rounded-lg text-sm bg-muted/60 font-medium text-text border-border cursor-not-allowed opacity-90 uppercase"
                    />
                  </div>

                  {/* Apellidos */}
                  <div className="md:col-span-2">
                    <Label
                      htmlFor={apellidosId}
                      className="text-xs font-semibold text-text mb-1.5 block"
                    >
                      Apellidos <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={apellidosId}
                      type="text"
                      value={apellidos}
                      disabled
                      readOnly
                      className="w-full rounded-lg text-sm bg-muted/60 font-medium text-text border-border cursor-not-allowed opacity-90 uppercase"
                    />
                  </div>
                </div>

                {/* Fila 2: Correo Electrónico y Número de Celular (Editables) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Correo Electrónico */}
                  <div>
                    <Label
                      htmlFor={correoId}
                      className="text-xs font-semibold text-text mb-1.5 block"
                    >
                      Correo Electrónico
                    </Label>
                    <Input
                      id={correoId}
                      type="email"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      placeholder="Ej. usuario@ugel-lampa.gob.pe"
                      className={cn(
                        'w-full rounded-lg text-sm bg-background',
                        errors.correo && 'border-destructive focus-visible:ring-destructive/30',
                      )}
                    />
                    {errors.correo && (
                      <span className="block mt-1 text-[0.72rem] text-destructive font-medium">
                        {errors.correo}
                      </span>
                    )}
                  </div>

                  {/* Número de Celular */}
                  <div>
                    <Label
                      htmlFor={celularId}
                      className="text-xs font-semibold text-text mb-1.5 block"
                    >
                      Número de Celular
                    </Label>
                    <Input
                      id={celularId}
                      type="tel"
                      value={celular}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                        setCelular(val);
                      }}
                      placeholder="Ej. 987654321"
                      className={cn(
                        'w-full rounded-lg text-sm bg-background',
                        errors.celular && 'border-destructive focus-visible:ring-destructive/30',
                      )}
                    />
                    {errors.celular && (
                      <span className="block mt-1 text-[0.72rem] text-destructive font-medium">
                        {errors.celular}
                      </span>
                    )}
                  </div>
                </div>

                {/* Botones de acción al pie */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                    className="cursor-pointer text-xs font-semibold px-4 py-2"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="cursor-pointer text-xs font-semibold px-5 py-2 flex items-center gap-2 bg-primary text-white hover:bg-primary/90 transition-colors shadow-xs"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <span>Guardar Cambios</span>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
