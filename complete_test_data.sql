-- ===============================
-- DATOS DE PRUEBA COMPLETOS PARA CODECTI PLATFORM
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
  'El Departamento del Chocó presenta oficialmente la Plataforma CODECTI, una iniciativa revolucionaria para fortalecer el ecosistema de Ciencia, Tecnología e Innovación en la región. Esta plataforma permitirá a investigadores, académicos y emprendedores colaborar de manera más efectiva en proyectos que impulsen el desarrollo sostenible del territorio chocoano.

La plataforma incluye herramientas avanzadas para la gestión de proyectos de investigación, un portal público para la divulgación científica, sistemas de colaboración entre instituciones y un robusto sistema de indicadores para medir el impacto de las iniciativas CTeI.

"Esta es una apuesta estratégica por el futuro del Chocó", declaró el Secretario de Educación Departamental. "Queremos que nuestra región sea reconocida no solo por su biodiversidad, sino también por su capacidad de innovación y desarrollo tecnológico".',
  'El Chocó lanza oficialmente su plataforma de gestión de proyectos de Ciencia, Tecnología e Innovación.',
  1,
  'announcement',
  'published'
),
(
  'Nueva Convocatoria de Proyectos de Biotecnología Marina',
  'Se abre una nueva convocatoria para proyectos de investigación en biotecnología marina, dirigida especialmente al aprovechamiento sostenible de los recursos marinos del Pacífico chocoano. Los proyectos seleccionados recibirán financiación por hasta $200 millones de pesos y acompañamiento técnico especializado.

Las líneas de investigación prioritarias incluyen: bioprospección de organismos marinos, desarrollo de productos biotecnológicos, tecnologías de acuicultura sostenible, y conservación de ecosistemas marinos.

Los interesados pueden presentar sus propuestas hasta el 30 de octubre. Se dará prioridad a proyectos que involucren comunidades locales y que generen impacto social y económico en el territorio.',
  'Nueva convocatoria ofrece hasta $200 millones para proyectos de biotecnología marina en el Pacífico chocoano.',
  2,
  'convocatoria',
  'published'
),
(
  'Seminario Internacional de Tecnologías Verdes',
  'El próximo mes se realizará el Seminario Internacional "Tecnologías Verdes para el Desarrollo Sostenible del Chocó", que contará con la participación de expertos nacionales e internacionales en minería sostenible, energías renovables y biotecnología.

El evento incluirá conferencias magistrales, talleres prácticos y espacios de networking para investigadores, empresarios y tomadores de decisiones. Se espera la participación de más de 200 asistentes de diferentes países de América Latina.

Entre los temas centrales están: tecnologías limpias para la minería artesanal, sistemas de energía solar y eólica para zonas rurales, y aprovechamiento biotecnológico de la biodiversidad chocoana.',
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
),
(
  'Webinar: Inteligencia Artificial en la Agricultura',
  'Conferencia virtual sobre aplicaciones de IA para optimizar la producción agrícola en el Chocó.',
  'webinar',
  '2025-09-30 15:00:00',
  '2025-09-30 17:00:00',
  'Plataforma Zoom',
  100,
  true,
  3,
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
),
(
  'Kit de Herramientas de Innovación Social',
  'Conjunto de herramientas metodológicas para desarrollar proyectos de innovación social en comunidades rurales.',
  'document',
  'https://innovacion-social.choco.gov.co/toolkit',
  'innovacion',
  1,
  '["innovacion_social", "metodologia", "comunidades", "desarrollo"]',
  true
),
(
  'Atlas de Energías Renovables del Chocó',
  'Mapas y datos sobre el potencial de energías renovables en diferentes zonas del departamento.',
  'document',
  'https://energia.choco.gov.co/atlas-renovables',
  'energia',
  2,
  '["energia_renovable", "solar", "eolica", "hidroelectrica", "mapas"]',
  true
);

-- ===============================
-- INSERTAR DATOS DE PUBLICACIONES
-- ===============================
INSERT OR IGNORE INTO publications (title, abstract, authors, publication_type, journal_name, publication_date, doi, keywords, category, status, submitted_by) VALUES 
(
  'Biodiversidad Marina del Pacífico Chocoano: Estado Actual y Perspectivas de Conservación',
  'Este estudio presenta un análisis exhaustivo de la biodiversidad marina en las costas del Pacífico chocoano, identificando especies endémicas y evaluando el estado de conservación de los ecosistemas marinos. Se documentaron 342 especies de peces, 78 especies de invertebrados marinos y 15 especies de mamíferos marinos. Los resultados evidencian la importancia ecológica de la región y la necesidad urgente de implementar estrategias de conservación efectivas.',
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
  'La minería artesanal en el Chocó enfrenta desafíos ambientales significativos. Este trabajo presenta el desarrollo y validación de tecnologías limpias que permiten la extracción de oro con menor impacto ambiental. Las tecnologías propuestas reducen el uso de mercurio en un 85% y aumentan la eficiencia de recuperación de oro en un 30%.',
  '["Carlos Alberto Mosquera", "Ingenieros Sin Fronteras"]',
  'report',
  'Minería y Ambiente Sostenible',
  '2024-06-10',
  '10.18273/mas.v8n1.67890',
  '["minería artesanal", "tecnologías limpias", "mercurio", "sostenibilidad"]',
  'tecnologia',
  'published',
  3
),
(
  'Plantas Medicinales del Chocó: Sistematización del Conocimiento Tradicional',
  'Investigación etnobotánica que documenta el uso tradicional de plantas medicinales por parte de comunidades afrodescendientes e indígenas del Chocó. Se identificaron 127 especies con usos medicinales documentados y se validaron científicamente 43 de ellas. Este trabajo contribuye a la preservación del conocimiento ancestral y abre posibilidades para el desarrollo de fitomedicamentos.',
  '["Ana Lucía Palacios", "Consejo Comunitario Mayor", "Universidad del Chocó"]',
  'book',
  'Editorial Universidad del Chocó',
  '2024-09-01',
  null,
  '["plantas medicinales", "etnobotánica", "conocimiento tradicional", "fitomedicamentos"]',
  'medicina',
  'published',
  4
);

-- ===============================
-- INSERTAR NOTIFICACIONES DE EJEMPLO
-- ===============================
INSERT OR IGNORE INTO notifications (user_id, title, message, type, priority, delivery_method, related_entity_type, created_by) VALUES 
(1, 'Sistema actualizado exitosamente', 'La plataforma CODECTI ha sido actualizada con nuevas funcionalidades.', 'success', 'medium', '["in_app"]', 'system', 1),
(1, 'Nuevo evento próximo', 'Seminario Internacional de Tecnologías Verdes en 2 días.', 'warning', 'high', '["in_app", "email"]', 'events', 1),
(2, 'Proyecto asignado', 'Se te ha asignado al proyecto de Biodiversidad Marina.', 'info', 'medium', '["in_app"]', 'projects', 1),
(3, 'Publicación aprobada', 'Tu artículo sobre Tecnologías Limpias ha sido aprobado.', 'success', 'high', '["in_app", "email"]', 'publications', 1);

-- ===============================
-- ACTUALIZAR ESTADÍSTICAS DE PROYECTOS EXISTENTES
-- ===============================
UPDATE projects SET 
  summary = CASE 
    WHEN title LIKE '%Biodiversidad%' THEN 'Estudio integral de la biodiversidad acuática en cuencas hidrográficas del Chocó, con especial énfasis en especies endémicas y en riesgo de extinción.'
    WHEN title LIKE '%Tecnologías Verdes%' THEN 'Desarrollo de tecnologías ambientalmente sostenibles para la actividad minera, reduciendo impacto ecológico y promoviendo prácticas responsables.'
    WHEN title LIKE '%Cadenas Productivas%' THEN 'Fortalecimiento integral de cadenas productivas agrícolas (cacao, plátano, frutas tropicales) en comunidades rurales chocoanas.'
    WHEN title LIKE '%Medicina Tradicional%' THEN 'Sistematización científica del conocimiento ancestral sobre plantas medicinales de comunidades afrodescendientes e indígenas.'
    WHEN title LIKE '%Tecnologías de Información%' THEN 'Implementación de soluciones tecnológicas innovadoras para mejorar acceso y calidad educativa en zonas rurales dispersas.'
    ELSE summary
  END,
  start_date = '2024-01-15',
  end_date = CASE 
    WHEN status = 'completed' THEN '2024-08-30'
    ELSE '2025-12-31'
  END,
  budget = CASE 
    WHEN title LIKE '%Biodiversidad%' THEN 180000000
    WHEN title LIKE '%Tecnologías Verdes%' THEN 250000000
    WHEN title LIKE '%Cadenas Productivas%' THEN 150000000
    WHEN title LIKE '%Medicina Tradicional%' THEN 120000000
    WHEN title LIKE '%Tecnologías de Información%' THEN 200000000
    ELSE 100000000
  END,
  institution = CASE 
    WHEN created_by = 2 THEN 'Universidad Tecnológica del Chocó'
    WHEN created_by = 3 THEN 'Instituto de Investigaciones Ambientales del Pacífico'
    WHEN created_by = 4 THEN 'Corporación Universidad del Chocó'
    ELSE 'CODECTI Chocó'
  END;

-- Agregar indicadores de rendimiento si la tabla existe
CREATE TABLE IF NOT EXISTS indicators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  current_value REAL DEFAULT 0,
  target_value REAL,
  unit TEXT,
  measurement_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO indicators (name, description, category, current_value, target_value, unit, measurement_date, status) VALUES
('Proyectos Activos', 'Número total de proyectos de investigación activos', 'proyectos', 4, 10, 'proyectos', '2025-09-10', 'active'),
('Publicaciones Científicas', 'Artículos científicos publicados este año', 'investigacion', 3, 15, 'publicaciones', '2025-09-10', 'active'),
('Eventos Realizados', 'Eventos académicos y de divulgación realizados', 'eventos', 2, 12, 'eventos', '2025-09-10', 'active'),
('Recursos Disponibles', 'Recursos digitales disponibles en la plataforma', 'recursos', 5, 25, 'recursos', '2025-09-10', 'active'),
('Usuarios Registrados', 'Investigadores y colaboradores registrados', 'usuarios', 6, 50, 'usuarios', '2025-09-10', 'active');

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
SELECT 'publications' as tabla, COUNT(*) as registros FROM publications
UNION ALL
SELECT 'notifications' as tabla, COUNT(*) as registros FROM notifications;