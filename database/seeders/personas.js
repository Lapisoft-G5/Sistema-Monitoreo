import { prisma } from './_lib/prisma.js';
import { randomUUID } from 'node:crypto';
import bcrypt from '../../apps/backend/node_modules/bcrypt/bcrypt.js';
import { validarDNI, validarEmail, validarEdadPlausible } from './_lib/helpers.js';

/**
 * Personas, usuarios, especialistas y docentes.
 *
 * Datos de calidad:
 * - DNI peruano valido (8 digitos, primer digito no 0 tipicamente)
 * - Emails patron nombre.apellido@ugel.gob.pe
 * - Fechas de nacimiento plausibles (25-65 anos)
 * - Nombres y apellidos peruanos realistas
 */

const USERS = [
  {
    "dni": "40000001",
    "firstName": "Carlos",
    "lastName": "Mendoza Quispe",
    "email": "carlos.mendoza@ugel.gob.pe",
    "role": "director_ugel",
    "fechaNacimiento": "1975-03-15"
  },
  {
    "dni": "40000002",
    "firstName": "Maria Elena",
    "lastName": "Huaman Vargas",
    "email": "maria.huaman@ugel.gob.pe",
    "role": "jefe_gestion",
    "fechaNacimiento": "1972-08-22",
    "nivelEducativo": "Secundaria",
    "especialidad": "Matematica"
  },
  {
    "dni": "40000003",
    "firstName": "Jose Luis",
    "lastName": "Quispe Mamani",
    "email": "jose.quispe@ugel.gob.pe",
    "role": "jefe_area",
    "fechaNacimiento": "1980-05-10",
    "nivelEducativo": "Secundaria",
    "especialidades": [
      "Comunicacion",
      "Matematica",
      "EPT"
    ]
  },
  {
    "dni": "40000004",
    "firstName": "Martha",
    "lastName": "Perez",
    "email": "martha.perez@ugel.gob.pe",
    "role": "jefe_area",
    "fechaNacimiento": "1981-06-15",
    "nivelEducativo": "Primaria",
    "especialidades": [
      "PIP",
      "Educacion Fisica"
    ]
  },
  {
    "dni": "40000005",
    "firstName": "Sofia",
    "lastName": "Gomez",
    "email": "sofia.gomez@ugel.gob.pe",
    "role": "jefe_area",
    "fechaNacimiento": "1978-02-20",
    "nivelEducativo": "Inicial"
  },
  {
    "dni": "40000006",
    "firstName": "Ana Lucia",
    "lastName": "Ticona Coila",
    "email": "ana.ticona@ugel.gob.pe",
    "role": "especialista",
    "fechaNacimiento": "1985-11-03",
    "nivelEducativo": "Primaria",
    "especialidades": [
      "PIP",
      "Educacion Fisica"
    ]
  },
  {
    "dni": "40000007",
    "firstName": "Pedro Pablo",
    "lastName": "Mamani Cruz",
    "email": "pedro.mamani@ugel.gob.pe",
    "role": "especialista",
    "fechaNacimiento": "1982-07-19",
    "nivelEducativo": "Secundaria",
    "especialidades": [
      "CTA",
      "Ciencias Sociales",
      "EPT"
    ]
  },
  {
    "dni": "40000008",
    "firstName": "Lidia",
    "lastName": "Salinas",
    "email": "lidia.salinas@ugel.gob.pe",
    "role": "especialista",
    "fechaNacimiento": "1988-04-20",
    "nivelEducativo": "Secundaria",
    "especialidades": [
      "Matematica",
      "Comunicacion",
      "Ingles"
    ]
  },
  {
    "dni": "40000009",
    "firstName": "Carmen",
    "lastName": "Rios",
    "email": "carmen.rios@ugel.gob.pe",
    "role": "especialista",
    "fechaNacimiento": "1983-09-12",
    "nivelEducativo": "Inicial"
  },
  {
    "dni": "40000100",
    "firstName": "Roberto",
    "lastName": "Chuquimia",
    "email": "roberto.chuquimia@ugel.gob.pe",
    "role": "especialista",
    "fechaNacimiento": "1981-10-10",
    "nivelEducativo": "Primaria",
    "especialidades": [
      "PIP"
    ]
  },
  {
    "dni": "40000101",
    "firstName": "Juliana",
    "lastName": "Huaricallo",
    "email": "juliana.huaricallo@ugel.gob.pe",
    "role": "especialista",
    "fechaNacimiento": "1986-05-05",
    "nivelEducativo": "Inicial"
  },
  {
    "dni": "40000010",
    "firstName": "Director Silvia",
    "lastName": "Apaza Quispe",
    "email": "dir_0200001@ugel.gob.pe",
    "role": "director_institucion",
    "fechaNacimiento": "1980-01-01",
    "institucionCodigoModular": "0200001",
    "nivelEducativo": "Secundaria",
    "condicionLaboral": "Designado"
  },
  {
    "dni": "40000011",
    "firstName": "Coord Victor",
    "lastName": "Condori Gomez",
    "email": "coord_0200001@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1982-01-01",
    "institucionCodigoModular": "0200001",
    "nivelEducativo": "Secundaria",
    "curso": "Ciencias Sociales",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Coordinador Pedagógico"
  },
  {
    "dni": "40000012",
    "firstName": "Taller Silvia",
    "lastName": "Perez Quispe",
    "email": "taller_0200001@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1983-01-01",
    "institucionCodigoModular": "0200001",
    "nivelEducativo": "Secundaria",
    "curso": "Ciencias Sociales",
    "secciones": [
      {
        "grado": "1",
        "seccion": "B"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Jefe de Taller"
  },
  {
    "dni": "40000013",
    "firstName": "Docente1 Silvia",
    "lastName": "Quispe Rios",
    "email": "docente1_0200001@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200001",
    "nivelEducativo": "Secundaria",
    "curso": "Ciencias Sociales",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000014",
    "firstName": "Docente2 Veronica",
    "lastName": "Choque Choque",
    "email": "docente2_0200001@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200001",
    "nivelEducativo": "Secundaria",
    "curso": "Ciencias Sociales",
    "secciones": [
      {
        "grado": "2",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000015",
    "firstName": "Docente3 Alberto",
    "lastName": "Rios Flores",
    "email": "docente3_0200001@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200001",
    "nivelEducativo": "Secundaria",
    "curso": "Ciencias Sociales",
    "secciones": [
      {
        "grado": "3",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000016",
    "firstName": "Director Marco",
    "lastName": "Rios Condori",
    "email": "dir_0200002@ugel.gob.pe",
    "role": "director_institucion",
    "fechaNacimiento": "1980-01-01",
    "institucionCodigoModular": "0200002",
    "nivelEducativo": "Primaria",
    "condicionLaboral": "Designado"
  },
  {
    "dni": "40000017",
    "firstName": "Docente4 Hugo","lastName": "Apaza Rios","email": "docente4_0200002@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1982-01-01",
    "institucionCodigoModular": "0200002",
    "nivelEducativo": "Primaria",
    "curso": "Matematica",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000018",
    "firstName": "Docente5 Veronica",
    "lastName": "Apaza Condori",
    "email": "docente5_0200002@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1983-01-01",
    "institucionCodigoModular": "0200002",
    "nivelEducativo": "Primaria",
    "curso": "Matematica",
    "secciones": [
      {
        "grado": "1",
        "seccion": "B"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000019",
    "firstName": "Docente1 Roberto",
    "lastName": "Caceres Rios",
    "email": "docente1_0200002@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200002",
    "nivelEducativo": "Primaria",
    "curso": "Matematica",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000020",
    "firstName": "Docente2 Alberto",
    "lastName": "Mamani Gomez",
    "email": "docente2_0200002@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200002",
    "nivelEducativo": "Primaria",
    "curso": "Matematica",
    "secciones": [
      {
        "grado": "2",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000021",
    "firstName": "Docente3 Alberto",
    "lastName": "Caceres Mamani",
    "email": "docente3_0200002@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200002",
    "nivelEducativo": "Primaria",
    "curso": "Matematica",
    "secciones": [
      {
        "grado": "3",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000022",
    "firstName": "Director Veronica",
    "lastName": "Perez Mamani",
    "email": "dir_0200003@ugel.gob.pe",
    "role": "director_institucion",
    "fechaNacimiento": "1980-01-01",
    "institucionCodigoModular": "0200003",
    "nivelEducativo": "Inicial",
    "condicionLaboral": "Designado"
  },
  {
    "dni": "40000023",
    "firstName": "Docente4 Roberto",
    "lastName": "Caceres Perez",
    "email": "docente4_0200003@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1982-01-01",
    "institucionCodigoModular": "0200003",
    "nivelEducativo": "Inicial",
    "curso": "Comunicacion",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000024",
    "firstName": "Docente5 Hugo",
    "lastName": "Apaza Choque",
    "email": "docente5_0200003@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1983-01-01",
    "institucionCodigoModular": "0200003",
    "nivelEducativo": "Inicial",
    "curso": "Comunicacion",
    "secciones": [
      {
        "grado": "1",
        "seccion": "B"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000025",
    "firstName": "Docente1 Julio",
    "lastName": "Flores Caceres",
    "email": "docente1_0200003@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200003",
    "nivelEducativo": "Inicial",
    "curso": "Comunicacion",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000026",
    "firstName": "Docente2 Alberto",
    "lastName": "Choque Condori",
    "email": "docente2_0200003@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200003",
    "nivelEducativo": "Inicial",
    "curso": "Comunicacion",
    "secciones": [
      {
        "grado": "2",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000027",
    "firstName": "Docente3 Manuel",
    "lastName": "Perez Mamani",
    "email": "docente3_0200003@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200003",
    "nivelEducativo": "Inicial",
    "curso": "Comunicacion",
    "secciones": [
      {
        "grado": "3",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000028",
    "firstName": "Director Marco",
    "lastName": "Condori Caceres",
    "email": "dir_0200004@ugel.gob.pe",
    "role": "director_institucion",
    "fechaNacimiento": "1980-01-01",
    "institucionCodigoModular": "0200004",
    "nivelEducativo": "Secundaria",
    "condicionLaboral": "Designado"
  },
  {
    "dni": "40000029",
    "firstName": "Coord Daniela",
    "lastName": "Quispe Gomez",
    "email": "coord_0200004@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1982-01-01",
    "institucionCodigoModular": "0200004",
    "nivelEducativo": "Secundaria",
    "curso": "CTA",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Coordinador Pedagógico"
  },
  {
    "dni": "40000030",
    "firstName": "Taller Daniela",
    "lastName": "Gomez Apaza",
    "email": "taller_0200004@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1983-01-01",
    "institucionCodigoModular": "0200004",
    "nivelEducativo": "Secundaria",
    "curso": "CTA",
    "secciones": [
      {
        "grado": "1",
        "seccion": "B"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Jefe de Taller"
  },
  {
    "dni": "40000031",
    "firstName": "Docente1 Veronica",
    "lastName": "Gomez Caceres",
    "email": "docente1_0200004@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200004",
    "nivelEducativo": "Secundaria",
    "curso": "CTA",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000032",
    "firstName": "Docente2 Luis",
    "lastName": "Condori Borda",
    "email": "docente2_0200004@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200004",
    "nivelEducativo": "Secundaria",
    "curso": "CTA",
    "secciones": [
      {
        "grado": "2",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000033",
    "firstName": "Docente3 Daniela",
    "lastName": "Quispe Gomez",
    "email": "docente3_0200004@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200004",
    "nivelEducativo": "Secundaria",
    "curso": "CTA",
    "secciones": [
      {
        "grado": "3",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000034",
    "firstName": "Director Roberto",
    "lastName": "Mamani Condori",
    "email": "dir_0200005@ugel.gob.pe",
    "role": "director_institucion",
    "fechaNacimiento": "1980-01-01",
    "institucionCodigoModular": "0200005",
    "nivelEducativo": "Primaria",
    "condicionLaboral": "Designado"
  },
  {
    "dni": "40000035",
    "firstName": "Docente4 Alberto",
    "lastName": "Choque Flores",
    "email": "docente4_0200005@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1982-01-01",
    "institucionCodigoModular": "0200005",
    "nivelEducativo": "Primaria",
    "curso": "Personal Social",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000036",
    "firstName": "Docente5 Luis",
    "lastName": "Gomez Choque",
    "email": "docente5_0200005@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1983-01-01",
    "institucionCodigoModular": "0200005",
    "nivelEducativo": "Primaria",
    "curso": "Personal Social",
    "secciones": [
      {
        "grado": "1",
        "seccion": "B"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000037",
    "firstName": "Docente1 Hugo",
    "lastName": "Caceres Mamani",
    "email": "docente1_0200005@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200005",
    "nivelEducativo": "Primaria",
    "curso": "Personal Social",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000038",
    "firstName": "Docente2 Alberto",
    "lastName": "Apaza Perez",
    "email": "docente2_0200005@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200005",
    "nivelEducativo": "Primaria",
    "curso": "Personal Social",
    "secciones": [
      {
        "grado": "2",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000039",
    "firstName": "Docente3 Andrea",
    "lastName": "Flores Rios",
    "email": "docente3_0200005@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200005",
    "nivelEducativo": "Primaria",
    "curso": "Personal Social",
    "secciones": [
      {
        "grado": "3",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000040",
    "firstName": "Director Roberto",
    "lastName": "Apaza Rios",
    "email": "dir_0200006@ugel.gob.pe",
    "role": "director_institucion",
    "fechaNacimiento": "1980-01-01",
    "institucionCodigoModular": "0200006",
    "nivelEducativo": "Secundaria",
    "condicionLaboral": "Designado"
  },
  {
    "dni": "40000041",
    "firstName": "Coord Lucia",
    "lastName": "Choque Mamani",
    "email": "coord_0200006@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1982-01-01",
    "institucionCodigoModular": "0200006",
    "nivelEducativo": "Secundaria",
    "curso": "Matematica",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Coordinador Pedagógico"
  },
  {
    "dni": "40000042",
    "firstName": "Taller Andrea",
    "lastName": "Apaza Caceres",
    "email": "taller_0200006@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1983-01-01",
    "institucionCodigoModular": "0200006",
    "nivelEducativo": "Secundaria",
    "curso": "Matematica",
    "secciones": [
      {
        "grado": "1",
        "seccion": "B"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Jefe de Taller"
  },
  {
    "dni": "40000043",
    "firstName": "Docente1 Hugo",
    "lastName": "Borda Rios",
    "email": "docente1_0200006@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200006",
    "nivelEducativo": "Secundaria",
    "curso": "Matematica",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000044",
    "firstName": "Docente2 Roberto",
    "lastName": "Quispe Choque",
    "email": "docente2_0200006@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200006",
    "nivelEducativo": "Secundaria",
    "curso": "Matematica",
    "secciones": [
      {
        "grado": "2",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000045",
    "firstName": "Docente3 Julio",
    "lastName": "Choque Choque",
    "email": "docente3_0200006@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200006",
    "nivelEducativo": "Secundaria",
    "curso": "Matematica",
    "secciones": [
      {
        "grado": "3",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000046",
    "firstName": "Director Roberto",
    "lastName": "Mamani Apaza",
    "email": "dir_0200007@ugel.gob.pe",
    "role": "director_institucion",
    "fechaNacimiento": "1980-01-01",
    "institucionCodigoModular": "0200007",
    "nivelEducativo": "Inicial",
    "condicionLaboral": "Designado"
  },
  {
    "dni": "40000047",
    "firstName": "Docente4 Victor",
    "lastName": "Quispe Flores",
    "email": "docente4_0200007@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1982-01-01",
    "institucionCodigoModular": "0200007",
    "nivelEducativo": "Inicial",
    "curso": "Matematica",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000048",
    "firstName": "Docente5 Silvia",
    "lastName": "Perez Apaza",
    "email": "docente5_0200007@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1983-01-01",
    "institucionCodigoModular": "0200007",
    "nivelEducativo": "Inicial",
    "curso": "Matematica",
    "secciones": [
      {
        "grado": "1",
        "seccion": "B"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000049",
    "firstName": "Docente1 Daniela",
    "lastName": "Rios Apaza",
    "email": "docente1_0200007@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200007",
    "nivelEducativo": "Inicial",
    "curso": "Matematica",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000050",
    "firstName": "Docente2 Victor",
    "lastName": "Rios Apaza",
    "email": "docente2_0200007@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200007",
    "nivelEducativo": "Inicial",
    "curso": "Matematica",
    "secciones": [
      {
        "grado": "2",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000051",
    "firstName": "Docente3 Andrea",
    "lastName": "Quispe Flores",
    "email": "docente3_0200007@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200007",
    "nivelEducativo": "Inicial",
    "curso": "Matematica",
    "secciones": [
      {
        "grado": "3",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000052",
    "firstName": "Director Daniela",
    "lastName": "Condori Flores",
    "email": "dir_0200008@ugel.gob.pe",
    "role": "director_institucion",
    "fechaNacimiento": "1980-01-01",
    "institucionCodigoModular": "0200008",
    "nivelEducativo": "Secundaria",
    "condicionLaboral": "Designado"
  },
  {
    "dni": "40000053",
    "firstName": "Coord Manuel",
    "lastName": "Borda Perez",
    "email": "coord_0200008@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1982-01-01",
    "institucionCodigoModular": "0200008",
    "nivelEducativo": "Secundaria",
    "curso": "Ingles",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Coordinador Pedagógico"
  },
  {
    "dni": "40000054",
    "firstName": "Taller Andrea",
    "lastName": "Choque Condori",
    "email": "taller_0200008@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1983-01-01",
    "institucionCodigoModular": "0200008",
    "nivelEducativo": "Secundaria",
    "curso": "Ingles",
    "secciones": [
      {
        "grado": "1",
        "seccion": "B"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Jefe de Taller"
  },
  {
    "dni": "40000055",
    "firstName": "Docente1 Silvia",
    "lastName": "Borda Rios",
    "email": "docente1_0200008@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200008",
    "nivelEducativo": "Secundaria",
    "curso": "Ingles",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000056",
    "firstName": "Docente2 Lucia",
    "lastName": "Apaza Mamani",
    "email": "docente2_0200008@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200008",
    "nivelEducativo": "Secundaria",
    "curso": "Ingles",
    "secciones": [
      {
        "grado": "2",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000057",
    "firstName": "Docente3 Fernando",
    "lastName": "Perez Quispe",
    "email": "docente3_0200008@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200008",
    "nivelEducativo": "Secundaria",
    "curso": "Ingles",
    "secciones": [
      {
        "grado": "3",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000058",
    "firstName": "Director Veronica",
    "lastName": "Quispe Rios",
    "email": "dir_0200009@ugel.gob.pe",
    "role": "director_institucion",
    "fechaNacimiento": "1980-01-01",
    "institucionCodigoModular": "0200009",
    "nivelEducativo": "Avanzado",
    "condicionLaboral": "Designado"
  },
  {
    "dni": "40000059",
    "firstName": "Docente4 Victor",
    "lastName": "Borda Condori",
    "email": "docente4_0200009@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1982-01-01",
    "institucionCodigoModular": "0200009",
    "nivelEducativo": "Avanzado",
    "curso": "Comunicacion",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000060",
    "firstName": "Docente5 Daniela",
    "lastName": "Apaza Choque",
    "email": "docente5_0200009@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1983-01-01",
    "institucionCodigoModular": "0200009",
    "nivelEducativo": "Avanzado",
    "curso": "Comunicacion",
    "secciones": [
      {
        "grado": "1",
        "seccion": "B"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000061",
    "firstName": "Docente1 Veronica",
    "lastName": "Perez Gomez",
    "email": "docente1_0200009@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200009",
    "nivelEducativo": "Avanzado",
    "curso": "Comunicacion",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000062",
    "firstName": "Docente2 Daniela",
    "lastName": "Quispe Apaza",
    "email": "docente2_0200009@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200009",
    "nivelEducativo": "Avanzado",
    "curso": "Comunicacion",
    "secciones": [
      {
        "grado": "2",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000063",
    "firstName": "Docente3 Roberto",
    "lastName": "Borda Mamani",
    "email": "docente3_0200009@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200009",
    "nivelEducativo": "Avanzado",
    "curso": "Comunicacion",
    "secciones": [
      {
        "grado": "3",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000064",
    "firstName": "Director Marco",
    "lastName": "Rios Flores",
    "email": "dir_0200010@ugel.gob.pe",
    "role": "director_institucion",
    "fechaNacimiento": "1980-01-01",
    "institucionCodigoModular": "0200010",
    "nivelEducativo": "CEBE",
    "condicionLaboral": "Designado"
  },
  {
    "dni": "40000065",
    "firstName": "Docente4 Andrea",
    "lastName": "Apaza Apaza",
    "email": "docente4_0200010@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1982-01-01",
    "institucionCodigoModular": "0200010",
    "nivelEducativo": "CEBE",
    "curso": "Educacion Fisica",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000066",
    "firstName": "Docente5 Silvia",
    "lastName": "Flores Gomez",
    "email": "docente5_0200010@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1983-01-01",
    "institucionCodigoModular": "0200010",
    "nivelEducativo": "CEBE",
    "curso": "Educacion Fisica",
    "secciones": [
      {
        "grado": "1",
        "seccion": "B"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000067",
    "firstName": "Docente1 Veronica",
    "lastName": "Flores Caceres",
    "email": "docente1_0200010@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200010",
    "nivelEducativo": "CEBE",
    "curso": "Educacion Fisica",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000068",
    "firstName": "Docente2 Victor",
    "lastName": "Mamani Borda",
    "email": "docente2_0200010@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200010",
    "nivelEducativo": "CEBE",
    "curso": "Educacion Fisica",
    "secciones": [
      {
        "grado": "2",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000069",
    "firstName": "Docente3 Silvia",
    "lastName": "Borda Perez",
    "email": "docente3_0200010@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200010",
    "nivelEducativo": "CEBE",
    "curso": "Educacion Fisica",
    "secciones": [
      {
        "grado": "3",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000070",
    "firstName": "Director Andrea",
    "lastName": "Condori Apaza",
    "email": "dir_0200011@ugel.gob.pe",
    "role": "director_institucion",
    "fechaNacimiento": "1980-01-01",
    "institucionCodigoModular": "0200011",
    "nivelEducativo": "Mecánica de Motos y Vehículos Afines",
    "condicionLaboral": "Designado"
  },
  {
    "dni": "40000071",
    "firstName": "Docente4 Hugo",
    "lastName": "Rios Mamani",
    "email": "docente4_0200011@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1982-01-01",
    "institucionCodigoModular": "0200011",
    "nivelEducativo": "Mecánica de Motos y Vehículos Afines",
    "curso": "CTA",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000072",
    "firstName": "Docente5 Daniela",
    "lastName": "Apaza Mamani",
    "email": "docente5_0200011@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1983-01-01",
    "institucionCodigoModular": "0200011",
    "nivelEducativo": "Mecánica de Motos y Vehículos Afines",
    "curso": "CTA",
    "secciones": [
      {
        "grado": "1",
        "seccion": "B"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000073",
    "firstName": "Docente1 Roberto",
    "lastName": "Perez Condori",
    "email": "docente1_0200011@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200011",
    "nivelEducativo": "Mecánica de Motos y Vehículos Afines",
    "curso": "CTA",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000074",
    "firstName": "Docente2 Roberto",
    "lastName": "Gomez Choque",
    "email": "docente2_0200011@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200011",
    "nivelEducativo": "Mecánica de Motos y Vehículos Afines",
    "curso": "CTA",
    "secciones": [
      {
        "grado": "2",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000075",
    "firstName": "Docente3 Daniela",
    "lastName": "Choque Rios",
    "email": "docente3_0200011@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200011",
    "nivelEducativo": "Mecánica de Motos y Vehículos Afines",
    "curso": "CTA",
    "secciones": [
      {
        "grado": "3",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000076",
    "firstName": "Director Fernando",
    "lastName": "Borda Apaza",
    "email": "dir_0200012@ugel.gob.pe",
    "role": "director_institucion",
    "fechaNacimiento": "1980-01-01",
    "institucionCodigoModular": "0200012",
    "nivelEducativo": "PRITE",
    "condicionLaboral": "Designado"
  },
  {
    "dni": "40000077",
    "firstName": "Docente4 Julio",
    "lastName": "Perez Condori",
    "email": "docente4_0200012@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1982-01-01",
    "institucionCodigoModular": "0200012",
    "nivelEducativo": "PRITE",
    "curso": "Matematica",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000078",
    "firstName": "Docente5 Lucia",
    "lastName": "Mamani Apaza",
    "email": "docente5_0200012@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1983-01-01",
    "institucionCodigoModular": "0200012",
    "nivelEducativo": "PRITE",
    "curso": "Matematica",
    "secciones": [
      {
        "grado": "1",
        "seccion": "B"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 40,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000079",
    "firstName": "Docente1 Veronica",
    "lastName": "Rios Gomez",
    "email": "docente1_0200012@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200012",
    "nivelEducativo": "PRITE",
    "curso": "Matematica",
    "secciones": [
      {
        "grado": "1",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000080",
    "firstName": "Docente2 Alberto",
    "lastName": "Quispe Gomez",
    "email": "docente2_0200012@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200012",
    "nivelEducativo": "PRITE",
    "curso": "Matematica",
    "secciones": [
      {
        "grado": "2",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  },
  {
    "dni": "40000081",
    "firstName": "Docente3 Marco",
    "lastName": "Mamani Rios",
    "email": "docente3_0200012@ugel.gob.pe",
    "role": "docente",
    "fechaNacimiento": "1985-01-01",
    "institucionCodigoModular": "0200012",
    "nivelEducativo": "PRITE",
    "curso": "Matematica",
    "secciones": [
      {
        "grado": "3",
        "seccion": "A"
      }
    ],
    "condicionLaboral": "Nombrado",
    "cargaLaboral": 30,
    "cargoNombre": "Docente de Aula"
  }
];

const ESPECIALISTA_CARGO_POR_ROL = {
  especialista: 'Especialista',
  jefe_area: 'Jefe de Área',
  jefe_gestion: 'Jefe de Gestión',
};

export async function seedPersonas(ctx) {
  console.log('[personas] Seeding personas, usuarios, especialistas y docentes...');
  const saltRounds = 10;

  for (const u of USERS) {
    const ctxStr = `${u.role}/${u.dni}`;
    validarDNI(u.dni, ctxStr);
    validarEmail(u.email, ctxStr);
    validarEdadPlausible(new Date(u.fechaNacimiento), ctxStr);

    let finalRole = u.role;
    if (u.cargoNombre === 'Coordinador Pedagógico') {
      finalRole = 'coordinador_pedagogico';
    } else if (u.cargoNombre === 'Jefe de Taller') {
      finalRole = 'jefe_taller';
    } else if (u.cargoNombre === 'Director') {
      finalRole = 'director_institucion';
    }

    const rolId = ctx.roleMap[finalRole];
    if (!rolId) {
      console.warn(`[personas] Rol '${finalRole}' no existe, saltando ${u.dni}`);
      continue;
    }

    const persona = await prisma.persona.upsert({
      where: { dni: u.dni },
      update: {
        nombres: u.firstName,
        apellidos: u.lastName,
        correo: u.email,
      },
      create: {
        dni: u.dni,
        nombres: u.firstName,
        apellidos: u.lastName,
        correo: u.email,
      },
    });

    const passwordHash = await bcrypt.hash(u.dni, saltRounds);
    await prisma.usuario.upsert({
      where: { personaId: persona.id },
      update: { rolId, passwordHash, isActive: true, isFirstLogin: true },
      create: {
        personaId: persona.id,
        rolId,
        passwordHash,
        isActive: true,
        isFirstLogin: true,
      },
    });

    if (ESPECIALISTA_CARGO_POR_ROL[u.role]) {
      const cargoEsp = ESPECIALISTA_CARGO_POR_ROL[u.role];
      const condicionLaboral = cargoEsp === 'Jefe de Gestión' ? 'Nombrado' : u.condicionLaboral || 'Encargado';

      await prisma.especialista.upsert({
        where: { personaId: persona.id },
        update: {
          cargo: cargoEsp,
          nivelEducativo: u.nivelEducativo || 'Secundaria',
          condicionLaboral,
          cargaLaboral: 40,
          estado: 'Activo',
          modalidad: 'EBR',
        },
        create: {
          personaId: persona.id,
          cargo: cargoEsp,
          nivelEducativo: u.nivelEducativo || 'Secundaria',
          condicionLaboral,
          cargaLaboral: 40,
          estado: 'Activo',
          modalidad: 'EBR',
        },
      });

      const especialidadesToSeed = u.especialidades || (u.especialidad ? [u.especialidad] : []);
      for (let i = 0; i < especialidadesToSeed.length; i++) {
        const espNombre = especialidadesToSeed[i];
        const esp = await prisma.especialidad.findFirst({ where: { nombre: espNombre, isActive: true } });
        if (esp) {
          const espRow = await prisma.especialista.findUnique({ where: { personaId: persona.id } });
          if (espRow) {
            await prisma.especialistaEspecialidad.upsert({
              where: { especialistaId_especialidadId: { especialistaId: espRow.id, especialidadId: esp.id } },
              update: { esPrincipal: i === 0 },
              create: { especialistaId: espRow.id, especialidadId: esp.id, esPrincipal: i === 0 },
            });
          }
        }
      }
    }

    if (u.role === 'director_institucion' || u.role === 'docente') {
      const instId = u.institucionCodigoModular ? ctx.instMap[u.institucionCodigoModular] : null;
      if (!instId) {
        console.warn(`[personas] Institucion '${u.institucionCodigoModular}' no existe, saltando ${u.dni}`);
        continue;
      }
      const nivelDocente = await prisma.nivelEducativo.findFirst({
        where: { codigo: u.nivelEducativo || 'Secundaria', isActive: true },
      });
      const docente = await prisma.docente.upsert({
        where: { personaId: persona.id },
        update: {
          institucionId: instId,
          nivelEducativo: u.nivelEducativo || 'Secundaria',
          nivelEducativoId: nivelDocente?.id ?? null,
          modalidad: u.modalidad || 'EBR',
          gradoAcademico: 'Licenciado',
          estado: 'Activo',
          condicionLaboral: u.condicionLaboral || 'Nombrado',
          cargaLaboral: u.cargaLaboral ?? null,
        },
        create: {
          personaId: persona.id,
          institucionId: instId,
          nivelEducativo: u.nivelEducativo || 'Secundaria',
          nivelEducativoId: nivelDocente?.id ?? null,
          modalidad: u.modalidad || 'EBR',
          gradoAcademico: 'Licenciado',
          estado: 'Activo',
          condicionLaboral: u.condicionLaboral || 'Nombrado',
          cargaLaboral: u.cargaLaboral ?? null,
        },
      });

      if (u.curso) {
        const cursoKey = `${u.curso}||${u.nivelEducativo || 'Secundaria'}`;
        const cursoId = ctx.cursoMap[cursoKey];
        if (cursoId) {
          await prisma.docenteCurso.upsert({
            where: { docenteId_cursoId: { docenteId: docente.id, cursoId } },
            update: {},
            create: { docenteId: docente.id, cursoId },
          });
        } else {
          console.warn(`[personas] Curso '${u.curso}' para nivel '${u.nivelEducativo}' no existe, saltando`);
        }
      }

      if (u.secciones && u.secciones.length > 0) {
        for (const sec of u.secciones) {
          await prisma.docenteSeccion.upsert({
            where: {
              docenteId_grado_seccion: {
                docenteId: docente.id,
                grado: sec.grado,
                seccion: sec.seccion,
              },
            },
            update: {},
            create: { docenteId: docente.id, grado: sec.grado, seccion: sec.seccion },
          });
        }
      }

      const cargoNombre = u.cargoNombre || (u.role === 'director_institucion' ? 'Director' : 'Docente de Aula');
      const cargoId = ctx.cargoMap[cargoNombre];
      if (cargoId) {
        const existing = await prisma.docenteCargo.findFirst({ where: { docenteId: docente.id, cargoId } });
        if (!existing) {
          await prisma.docenteCargo.create({
            data: { docenteId: docente.id, cargoId, fechaInicio: new Date() },
          });
        }
      } else {
        console.warn(`[personas] Cargo '${cargoNombre}' no existe, saltando DocenteCargo de ${u.dni}`);
      }

      // Sincronizar Especialista si el cargo requiere que actúe como monitor/evaluador
      const isMonitor = ['Director', 'Coordinador Pedagógico', 'Jefe de Taller'].includes(cargoNombre);
      if (isMonitor) {
        await prisma.especialista.upsert({
          where: { personaId: persona.id },
          update: {
            cargo: cargoNombre,
            nivelEducativo: u.nivelEducativo || 'Secundaria',
            condicionLaboral: u.condicionLaboral || 'Nombrado',
            cargaLaboral: u.cargaLaboral ?? (cargoNombre === 'Coordinador Pedagógico' ? 40 : 30),
            estado: 'Activo',
            modalidad: u.modalidad || 'EBR',
          },
          create: {
            personaId: persona.id,
            cargo: cargoNombre,
            nivelEducativo: u.nivelEducativo || 'Secundaria',
            condicionLaboral: u.condicionLaboral || 'Nombrado',
            cargaLaboral: u.cargaLaboral ?? (cargoNombre === 'Coordinador Pedagógico' ? 40 : 30),
            estado: 'Activo',
            modalidad: u.modalidad || 'EBR',
          },
        });
      }
    }
  }

  console.log(`[personas] ${USERS.length} usuarios listos.`);

  // ── Backfill Fase 2: EspecialistaCargo + es_principal en DocenteCargo ──
  // El migration SQL hace el backfill cuando se ejecuta sobre una BD vacia,
  // pero el seeder corre DESPUES. Re-ejecutamos aqui para asegurar el sync
  // con la data sembrada.

  // EspecialistaCargo: un registro activo por Especialista, espejando
  // `especialistas.cargo` con es_principal = true.
  const especialistas = await prisma.especialista.findMany({
    select: { id: true, cargo: true, createdAt: true },
  });
  for (const esp of especialistas) {
    const existing = await prisma.especialistaCargo.findFirst({
      where: { especialistaId: esp.id, fechaFin: null },
    });
    if (!existing) {
      await prisma.especialistaCargo.create({
        data: {
          id: randomUUID(),
          especialistaId: esp.id,
          cargo: esp.cargo,
          fechaInicio: esp.createdAt,
          fechaFin: null,
          esPrincipal: true,
        },
      });
    } else {
      await prisma.especialistaCargo.update({
        where: { id: existing.id },
        data: { cargo: esp.cargo, esPrincipal: true, fechaFin: null },
      });
    }
  }

  // DocenteCargo.es_principal: el cargo activo de mayor prioridad por docente.
  const prioridad = {
    'Director': 1,
    'Subdirector': 2,
    'Coordinador Pedagógico': 3,
    'Jefe de Taller': 4,
    'PIP': 5,
    'Docente de Aula': 6,
  };
  const cargosAll = await prisma.cargo.findMany({ select: { id: true, nombre: true } });
  const cargoIdByNombre = new Map(cargosAll.map((c) => [c.nombre, c.id]));

  const docentesConCargos = await prisma.docente.findMany({
    include: {
      docenteCargos: {
        where: { fechaFin: null },
        include: { cargo: true },
      },
    },
  });
  for (const d of docentesConCargos) {
    if (d.docenteCargos.length === 0) continue;
    // Reset todos a false y marcar el de mayor prioridad
    await prisma.docenteCargo.updateMany({
      where: { docenteId: d.id },
      data: { esPrincipal: false },
    });
    const sorted = d.docenteCargos
      .slice()
      .sort((a, b) => {
        const pa = prioridad[a.cargo.nombre] ?? 99;
        const pb = prioridad[b.cargo.nombre] ?? 99;
        if (pa !== pb) return pa - pb;
        return b.fechaInicio.getTime() - a.fechaInicio.getTime();
      });
    const principal = sorted[0];
    await prisma.docenteCargo.update({
      where: { id: principal.id },
      data: { esPrincipal: true },
    });
  }

  console.log(
    `[personas] Backfill Fase 2: ${especialistas.length} EspecialistaCargo, ${docentesConCargos.length} docentes procesados.`,
  );
}
