-- ===============================
-- DATOS DE PRUEBA SIMPLIFICADOS PARA CODECTI PLATFORM
-- ===============================

-- Crear tablas que podrían no existir
CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  author_id INTEGER,
  image_url TEXT,
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'seminar',
  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME,
  location TEXT,
  max_participants INTEGER,
  registration_required BOOLEAN DEFAULT false,
  organizer_id INTEGER,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT DEFAULT 'document' CHECK (resource_type IN ('document', 'video', 'image', 'link', 'software')),
  file_url TEXT,
  external_url TEXT,
  category TEXT DEFAULT 'general',
  author_id INTEGER,
  download_count INTEGER DEFAULT 0,
  tags TEXT, -- JSON array
  is_public BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS publications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  abstract TEXT,
  authors TEXT NOT NULL, -- JSON array
  publication_type TEXT DEFAULT 'article' CHECK (publication_type IN ('article', 'book', 'report', 'thesis', 'conference')),
  journal_name TEXT,
  publication_date DATE,
  doi TEXT UNIQUE,
  isbn TEXT,
  keywords TEXT, -- JSON array
  file_url TEXT,
  external_url TEXT,
  citation_count INTEGER DEFAULT 0,
  category TEXT DEFAULT 'research',
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  submitted_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submitted_by) REFERENCES users(id)
);

-- ===============================
-- INSERTAR DATOS DE NOTICIAS
-- ===============================
INSERT OR IGNORE INTO news (title, content, summary, author_id, category, status) VALUES 
(
  'Lanzamiento Oficial de la Plataforma CODECTI',
  'El Departamento del Chocó presenta oficialmente la Plataforma CODECTI, una iniciativa revolucionaria para fortalecer el ecosistema de Ciencia, Tecnología e Innovación en la región. Esta plataforma permitirá a investigadores, académicos y emprendedores colaborar de manera más efectiva en proyectos que impulsen el desarrollo sostenible del territorio chocoano.',
  'El Chocó lanza oficialmente su plataforma de gestión de proyectos de Ciencia, Tecnología e Innovación.',
  1,
  'announcement',
  'published'
),
(
  'Nueva Convocatoria de Proyectos de Biotecnología Marina',
  'Se abre una nueva convocatoria para proyectos de investigación en biotecnología marina, dirigida especialmente al aprovechamiento sostenible de los recursos marinos del Pacífico chocoano. Los proyectos seleccionados recibirán financiación por hasta $200 millones de pesos.',
  'Nueva convocatoria ofrece hasta $200 millones para proyectos de biotecnología marina en el Pacífico chocoano.',
  2,
  'convocatoria',
  'published'
),
(
  'Seminario Internacional de Tecnologías Verdes',
  'El próximo mes se realizará el Seminario Internacional "Tecnologías Verdes para el Desarrollo Sostenible del Chocó", que contará con la participación de expertos nacionales e internacionales en minería sostenible, energías renovables y biotecnología.',
  'Expertos internacionales se reunirán en el Chocó para discutir tecnologías verdes y desarrollo sostenible.',
  3,
  'evento',
  'published'
);

-- ===============================
-- INSERTAR DATOS DE EVENTOS
-- ===============================
INSERT OR IGNORE INTO events (title, description, event_type, start_datetime, end_datetime, location, max_participants, registration_required, organizer_id, status) VALUES 
(
  'Seminario Internacional de Tecnologías Verdes',
  'Seminario sobre tecnologías verdes y desarrollo sostenible para el Chocó, con expertos nacionales e internacionales.',
  'seminario',
  '2025-10-15 08:00:00',
  '2025-10-17 17:00:00',
  'Hotel San Martín, Quibdó',
  200,
  true,
  1,
  'upcoming'
),
(
  'Taller de Formulación de Proyectos CTeI',
  'Taller práctico para aprender a formular y presentar proyectos de Ciencia, Tecnología e Innovación de alta calidad.',
  'taller',
  '2025-09-25 14:00:00',
  '2025-09-25 18:00:00',
  'Universidad Tecnológica del Chocó, Aula Magna',
  50,
  true,
  2,
  'upcoming'
),
(
  'Feria de Innovación Chocoana',
  'Espacio para mostrar las innovaciones y emprendimientos tecnológicos desarrollados en el departamento.',
  'feria',
  '2025-11-20 09:00:00',
  '2025-11-22 16:00:00',
  'Centro de Convenciones, Quibdó',
  500,
  false,
  1,
  'upcoming'
);

-- ===============================
-- INSERTAR DATOS DE RECURSOS
-- ===============================
INSERT OR IGNORE INTO resources (title, description, resource_type, external_url, category, author_id, tags, is_public) VALUES 
(
  'Guía de Formulación de Proyectos CTeI',
  'Manual completo para la formulación de proyectos de Ciencia, Tecnología e Innovación, con ejemplos específicos para el contexto chocoano.',
  'document',
  'https://drive.google.com/file/example/guia-formulacion-ctei',
  'metodologia',
  1,
  '["formulacion", "proyectos", "metodologia", "investigacion"]',
  true
),
(
  'Base de Datos de Biodiversidad del Chocó',
  'Repositorio digital con información actualizada sobre la biodiversidad del departamento del Chocó.',
  'software',
  'https://biodiversidad.choco.gov.co',
  'biodiversidad',
  2,
  '["biodiversidad", "especies", "conservacion", "choco"]',
  true
),
(
  'Video: Técnicas de Minería Sostenible',
  'Serie de videos educativos sobre técnicas de minería artesanal sostenible y ambientalmente responsable.',
  'video',
  'https://youtube.com/playlist/mineria-sostenible-choco',
  'mineria',
  3,
  '["mineria", "sostenibilidad", "medio_ambiente", "tecnicas"]',
  true
);

-- ===============================
-- INSERTAR DATOS DE PUBLICACIONES
-- ===============================
INSERT OR IGNORE INTO publications (title, abstract, authors, publication_type, journal_name, publication_date, doi, keywords, category, status, submitted_by) VALUES 
(
  'Biodiversidad Marina del Pacífico Chocoano: Estado Actual y Perspectivas de Conservación',
  'Este estudio presenta un análisis exhaustivo de la biodiversidad marina en las costas del Pacífico chocoano, identificando especies endémicas y evaluando el estado de conservación de los ecosistemas marinos.',
  '["María Elena Rodríguez", "Carlos Mosquera", "Ana Palacios"]',
  'article',
  'Revista Colombiana de Biodiversidad Marina',
  '2024-08-15',
  '10.15446/rcdm.v15n2.12345',
  '["biodiversidad marina", "Pacífico chocoano", "conservación", "especies endémicas"]',
  'biodiversidad',
  'published',
  2
),
(
  'Tecnologías Limpias para la Minería Artesanal en el Chocó: Una Alternativa Sostenible',
  'La minería artesanal en el Chocó enfrenta desafíos ambientales significativos. Este trabajo presenta el desarrollo y validación de tecnologías limpias que permiten la extracción de oro con menor impacto ambiental.',
  '["Carlos Alberto Mosquera", "Ingenieros Sin Fronteras"]',
  'report',
  'Minería y Ambiente Sostenible',
  '2024-06-10',
  '10.18273/mas.v8n1.67890',
  '["minería artesanal", "tecnologías limpias", "mercurio", "sostenibilidad"]',
  'tecnologia',
  'published',
  3
);

-- Verificación final
SELECT 'users' as tabla, COUNT(*) as registros FROM users
UNION ALL
SELECT 'projects' as tabla, COUNT(*) as registros FROM projects
UNION ALL
SELECT 'news' as tabla, COUNT(*) as registros FROM news
UNION ALL
SELECT 'events' as tabla, COUNT(*) as registros FROM events
UNION ALL
SELECT 'resources' as tabla, COUNT(*) as registros FROM resources
UNION ALL
SELECT 'publications' as tabla, COUNT(*) as registros FROM publications;