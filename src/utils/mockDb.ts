// CODECTI Platform - Mock Database for Development

import type { User, Project, NewsArticle, NewsCategory, NewsTag } from '../types';

// Mock data for development
const mockUsers: User[] = [
  {
    id: 1,
    email: 'admin@codecti.choco.gov.co',
    name: 'Administrador CODECTI',
    role: 'admin',
    institution: 'CODECTI Chocó',
    created_at: '2025-01-01T00:00:00Z',
    is_active: true
  },
  {
    id: 2,
    email: 'investigador1@codecti.choco.gov.co',
    name: 'María Elena Rodríguez',
    role: 'collaborator',
    institution: 'Universidad Tecnológica del Chocó',
    created_at: '2025-01-01T00:00:00Z',
    is_active: true
  },
  {
    id: 3,
    email: 'investigador2@codecti.choco.gov.co',
    name: 'Carlos Alberto Mosquera',
    role: 'researcher',
    institution: 'SINCHI - Instituto Amazónico de Investigaciones Científicas',
    created_at: '2025-01-01T00:00:00Z',
    is_active: true
  }
];

const mockProjects: Project[] = [
  {
    id: 1,
    title: 'Biodiversidad Acuática del Chocó',
    responsible_person: 'investigador1@codecti.choco.gov.co',
    summary: 'Estudio comprehensive de la biodiversidad acuática en las principales cuencas hidrográficas del departamento del Chocó, con enfoque en especies endémicas y en peligro de extinción.',
    description: 'Este proyecto busca realizar un inventario completo de la biodiversidad acuática presente en las principales cuencas del Chocó, incluyendo el Atrato, San Juan y Baudó. Se utilizarán técnicas de muestreo tradicionales y tecnologías de vanguardia como el análisis de ADN ambiental.',
    objectives: 'Catalogar especies acuáticas endémicas, identificar especies en peligro, desarrollar estrategias de conservación',
    methodology: 'Muestreo sistemático, análisis de ADN ambiental, caracterización fisicoquímica de aguas',
    expected_results: 'Catálogo de biodiversidad acuática, mapas de distribución, estrategias de conservación',
    status: 'active',
    start_date: '2024-03-01',
    end_date: '2025-02-28',
    budget: 450000000,
    institution: 'Universidad Tecnológica del Chocó',
    research_area: 'Biodiversidad y Ecosistemas',
    keywords: 'biodiversidad, ecosistemas acuáticos, especies endémicas, conservación, Chocó',
    created_by: 2,
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z',
    creator_name: 'María Elena Rodríguez'
  },
  {
    id: 2,
    title: 'Desarrollo de Tecnologías Verdes para Minería Sostenible',
    responsible_person: 'investigador2@codecti.choco.gov.co',
    summary: 'Investigación aplicada para el desarrollo de tecnologías limpias que permitan la explotación minera responsable y sostenible en el Chocó, reduciendo el impacto ambiental.',
    description: 'El proyecto desarrolla tecnologías innovadoras para la minería artesanal de oro, incluyendo sistemas de procesamiento sin mercurio, técnicas de biorremediación y métodos de monitoreo ambiental en tiempo real.',
    objectives: 'Desarrollar tecnologías limpias, capacitar comunidades mineras, reducir contaminación por mercurio',
    methodology: 'Investigación participativa, desarrollo tecnológico, transferencia de conocimiento',
    expected_results: 'Tecnologías verdes implementadas, comunidades capacitadas, reducción de contaminación',
    status: 'active',
    start_date: '2024-06-01',
    end_date: '2025-12-31',
    budget: 680000000,
    institution: 'SINCHI - Instituto Amazónico de Investigaciones Científicas',
    research_area: 'Tecnología Ambiental',
    keywords: 'minería sostenible, tecnologías limpias, mercurio, biorremediación, comunidades',
    created_by: 3,
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2025-01-02T10:00:00Z',
    creator_name: 'Carlos Alberto Mosquera'
  },
  {
    id: 3,
    title: 'Fortalecimiento de Cadenas Productivas Agrícolas del Pacífico',
    responsible_person: 'investigador1@codecti.choco.gov.co',
    summary: 'Proyecto de innovación para el fortalecimiento de las cadenas productivas del cacao, plátano y frutas tropicales en comunidades rurales del Chocó.',
    description: 'Iniciativa integral que busca mejorar la productividad y competitividad de las cadenas agrícolas tradicionales del Chocó mediante la implementación de tecnologías apropiadas, fortalecimiento organizacional y acceso a mercados especializados.',
    objectives: 'Mejorar productividad agrícola, fortalecer organizaciones, facilitar acceso a mercados',
    methodology: 'Investigación acción participativa, transferencia tecnológica, desarrollo organizacional',
    expected_results: 'Aumento en productividad del 30%, organizaciones fortalecidas, nuevos mercados',
    status: 'completed',
    start_date: '2023-01-01',
    end_date: '2024-12-31',
    budget: 320000000,
    institution: 'Universidad Tecnológica del Chocó',
    research_area: 'Desarrollo Rural y Agrícola',
    keywords: 'cacao, plátano, frutas tropicales, cadenas productivas, desarrollo rural',
    created_by: 2,
    created_at: '2023-01-01T10:00:00Z',
    updated_at: '2024-12-31T10:00:00Z',
    creator_name: 'María Elena Rodríguez'
  },
  {
    id: 4,
    title: 'Medicina Tradicional y Plantas del Chocó Biogeográfico',
    responsible_person: 'investigador2@codecti.choco.gov.co',
    summary: 'Investigación etnobotánica sobre el conocimiento tradicional de plantas medicinales utilizadas por comunidades afrodescendientes e indígenas del Chocó.',
    description: 'Estudio sistemático del conocimiento ancestral sobre plantas medicinales, documentación de usos tradicionales, análisis fitoquímico de especies promisorias y validación científica de propiedades terapéuticas.',
    objectives: 'Documentar conocimiento ancestral, validar propiedades medicinales, conservar biodiversidad',
    methodology: 'Etnobotánica, análisis fitoquímico, estudios farmacológicos, documentación participativa',
    expected_results: 'Catálogo de plantas medicinales, productos naturales, protocolos de conservación',
    status: 'active',
    start_date: '2024-08-01',
    end_date: '2026-07-31',
    budget: 520000000,
    institution: 'SINCHI - Instituto Amazónico de Investigaciones Científicas',
    research_area: 'Etnobotánica y Farmacología',
    keywords: 'medicina tradicional, etnobotánica, plantas medicinales, conocimiento ancestral, fitoquímica',
    created_by: 3,
    created_at: '2024-08-01T10:00:00Z',
    updated_at: '2025-01-05T10:00:00Z',
    creator_name: 'Carlos Alberto Mosquera'
  },
  {
    id: 5,
    title: 'Cambio Climático y Vulnerabilidad Costera en el Pacífico Chocoano',
    responsible_person: 'investigador1@codecti.choco.gov.co',
    summary: 'Análisis de los efectos del cambio climático en las comunidades costeras del Pacífico chocoano y desarrollo de estrategias de adaptación.',
    description: 'Evaluación integral de la vulnerabilidad climática en municipios costeros, modelado de escenarios futuros, y diseño participativo de medidas de adaptación con comunidades locales.',
    objectives: 'Evaluar vulnerabilidad climática, desarrollar estrategias de adaptación, fortalecer resiliencia',
    methodology: 'Modelado climático, análisis de vulnerabilidad, planificación participativa',
    expected_results: 'Mapas de vulnerabilidad, estrategias de adaptación, comunidades resilientes',
    status: 'active',
    start_date: '2024-09-01',
    end_date: '2025-08-31',
    budget: 390000000,
    institution: 'Universidad Tecnológica del Chocó',
    research_area: 'Cambio Climático',
    keywords: 'cambio climático, vulnerabilidad, adaptación, comunidades costeras, resiliencia',
    created_by: 2,
    created_at: '2024-09-01T10:00:00Z',
    updated_at: '2025-01-08T10:00:00Z',
    creator_name: 'María Elena Rodríguez'
  },
  {
    id: 6,
    title: 'Innovación en Acuicultura Sostenible para el Pacífico',
    responsible_person: 'investigador2@codecti.choco.gov.co',
    summary: 'Desarrollo de sistemas de acuicultura sostenible adaptados a las condiciones del Pacífico chocoano, con enfoque en especies nativas.',
    description: 'Investigación aplicada para el desarrollo de tecnologías de acuicultura que aprovechen especies ícticas nativas, con sistemas de bajo impacto ambiental y alto potencial económico para las comunidades.',
    objectives: 'Desarrollar sistemas acuícolas sostenibles, capacitar productores, generar ingresos',
    methodology: 'Investigación aplicada, transferencia tecnológica, acompañamiento técnico',
    expected_results: 'Sistemas acuícolas funcionando, productores capacitados, ingresos generados',
    status: 'planning',
    start_date: '2025-03-01',
    end_date: '2027-02-28',
    budget: 720000000,
    institution: 'SINCHI - Instituto Amazónico de Investigaciones Científicas',
    research_area: 'Acuicultura y Pesca',
    keywords: 'acuicultura, especies nativas, sostenibilidad, desarrollo comunitario, Pacífico',
    created_by: 3,
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-01-10T10:00:00Z',
    creator_name: 'Carlos Alberto Mosquera'
  },
  {
    id: 7,
    title: 'Patrimonio Cultural Digital del Chocó',
    responsible_person: 'investigador1@codecti.choco.gov.co',
    summary: 'Digitalización y preservación del patrimonio cultural inmaterial del Chocó mediante tecnologías digitales avanzadas.',
    description: 'Proyecto de documentación digital del patrimonio cultural chocoano incluyendo música, danzas, tradiciones orales y artesanías, utilizando realidad virtual, inteligencia artificial y plataformas interactivas.',
    objectives: 'Preservar patrimonio cultural, crear archivos digitales, facilitar acceso educativo',
    methodology: 'Documentación digital, realidad virtual, inteligencia artificial, plataformas interactivas',
    expected_results: 'Archivo digital, museo virtual, plataforma educativa, patrimonio preservado',
    status: 'draft',
    start_date: '2025-06-01',
    end_date: '2026-12-31',
    budget: 280000000,
    institution: 'Universidad Tecnológica del Chocó',
    research_area: 'Patrimonio Cultural y TIC',
    keywords: 'patrimonio cultural, digitalización, realidad virtual, tradiciones, Chocó',
    created_by: 2,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    creator_name: 'María Elena Rodríguez'
  }
];

// HU-09: Mock data for News/Blog System
const mockNewsCategories: NewsCategory[] = [
  {
    id: 1,
    name: 'Ciencia y Tecnología',
    slug: 'ciencia-tecnologia',
    description: 'Avances científicos y desarrollos tecnológicos en el Chocó',
    color: '#3b82f6',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Innovación',
    slug: 'innovacion',
    description: 'Proyectos innovadores y emprendimientos tecnológicos',
    color: '#10b981',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: 'Biodiversidad',
    slug: 'biodiversidad',
    description: 'Investigación y conservación de la biodiversidad chocoana',
    color: '#059669',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 4,
    name: 'Desarrollo Sostenible',
    slug: 'desarrollo-sostenible',
    description: 'Proyectos de desarrollo sostenible y medio ambiente',
    color: '#84cc16',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 5,
    name: 'Educación CTeI',
    slug: 'educacion-ctei',
    description: 'Educación en ciencia, tecnología e innovación',
    color: '#f59e0b',
    created_at: '2025-01-01T00:00:00Z'
  }
];

const mockNewsTags: NewsTag[] = [
  { id: 1, name: 'Acuicultura', slug: 'acuicultura', created_at: '2025-01-01T00:00:00Z' },
  { id: 2, name: 'Biotecnología', slug: 'biotecnologia', created_at: '2025-01-01T00:00:00Z' },
  { id: 3, name: 'Conservación', slug: 'conservacion', created_at: '2025-01-01T00:00:00Z' },
  { id: 4, name: 'Sostenibilidad', slug: 'sostenibilidad', created_at: '2025-01-01T00:00:00Z' },
  { id: 5, name: 'Energías Renovables', slug: 'energias-renovables', created_at: '2025-01-01T00:00:00Z' },
  { id: 6, name: 'Investigación Marina', slug: 'investigacion-marina', created_at: '2025-01-01T00:00:00Z' },
  { id: 7, name: 'Tecnologías Limpias', slug: 'tecnologias-limpias', created_at: '2025-01-01T00:00:00Z' },
  { id: 8, name: 'Comunidades Afro', slug: 'comunidades-afro', created_at: '2025-01-01T00:00:00Z' },
  { id: 9, name: 'Pueblos Indígenas', slug: 'pueblos-indigenas', created_at: '2025-01-01T00:00:00Z' },
  { id: 10, name: 'Desarrollo Rural', slug: 'desarrollo-rural', created_at: '2025-01-01T00:00:00Z' }
];

const mockNewsArticles: NewsArticle[] = [
  {
    id: 1,
    title: 'CODECTI Chocó lanza nueva convocatoria para proyectos de acuicultura sostenible',
    slug: 'codecti-convocatoria-acuicultura-sostenible-2025',
    summary: 'La corporación destinará $5.000 millones para financiar proyectos innovadores en acuicultura que beneficien a las comunidades del Pacífico chocoano.',
    content: `<p>CODECTI Chocó anunció oficialmente el lanzamiento de su nueva convocatoria "Acuicultura Sostenible 2025", que destinará recursos por $5.000 millones de pesos para el financiamiento de proyectos innovadores en el sector acuícola del departamento.</p>

<p>La convocatoria busca promover el desarrollo de tecnologías limpias y sostenibles para el cultivo de especies nativas como el camarón, tilapia y bocachico, con especial énfasis en el beneficio directo a las comunidades afrodescendientes e indígenas del Pacífico chocoano.</p>

<h3>Líneas de Financiación</h3>
<p>Los recursos se distribuirán en tres líneas principales:</p>
<ul>
<li><strong>Innovación Tecnológica:</strong> $2.000 millones para desarrollo de nuevas tecnologías</li>
<li><strong>Fortalecimiento Comunitario:</strong> $2.000 millones para proyectos liderados por comunidades</li>
<li><strong>Investigación Aplicada:</strong> $1.000 millones para estudios de impacto y sostenibilidad</li>
</ul>

<p>Las postulaciones estarán abiertas hasta el 31 de marzo de 2025, y los resultados se publicarán en mayo del mismo año.</p>`,
    featured_image: '/static/news-acuicultura-2025.jpg',
    author_id: 1,
    author_name: 'Administrador CODECTI',
    author_email: 'admin@codecti.choco.gov.co',
    category_id: 2,
    category_name: 'Innovación',
    category_slug: 'innovacion',
    status: 'published',
    is_featured: true,
    tags: [
      { id: 1, name: 'Acuicultura', slug: 'acuicultura', created_at: '2025-01-01T00:00:00Z' },
      { id: 4, name: 'Sostenibilidad', slug: 'sostenibilidad', created_at: '2025-01-01T00:00:00Z' },
      { id: 8, name: 'Comunidades Afro', slug: 'comunidades-afro', created_at: '2025-01-01T00:00:00Z' }
    ],
    views_count: 1247,
    published_at: '2025-01-15T09:00:00Z',
    created_at: '2025-01-15T08:30:00Z',
    updated_at: '2025-01-15T09:00:00Z'
  },
  {
    id: 2,
    title: 'Investigadores del UTCH desarrollan bioplástico a partir de cáscara de cacao',
    slug: 'utch-bioplastico-cascara-cacao',
    summary: 'Un equipo de la Universidad Tecnológica del Chocó logró crear un material biodegradable innovador que podría revolucionar el manejo de residuos en la región.',
    content: `<p>Un grupo de investigadores de la Universidad Tecnológica del Chocó (UTCH), liderado por el Dr. Carlos Mosquera, ha desarrollado exitosamente un bioplástico revolucionario elaborado a partir de cáscaras de cacao, un subproducto abundante en la región.</p>

<p>El proyecto, financiado por CODECTI Chocó, representa un avance significativo en la búsqueda de alternativas sostenibles a los plásticos convencionales, aprovechando los residuos orgánicos de una de las principales actividades económicas del departamento.</p>

<h3>Características del Bioplástico</h3>
<p>El nuevo material presenta propiedades excepcionales:</p>
<ul>
<li><strong>100% biodegradable</strong> en un período de 6 meses</li>
<li><strong>Resistencia mecánica</strong> comparable a plásticos tradicionales</li>
<li><strong>Bajo costo de producción</strong> utilizando residuos locales</li>
<li><strong>Proceso de fabricación</strong> limpio y ambientalmente responsable</li>
</ul>

<p>La investigación ha captado la atención de empresas internacionales interesadas en licenciar la tecnología, lo que podría generar importantes recursos para la región.</p>`,
    featured_image: '/static/news-bioplastico-cacao.jpg',
    author_id: 2,
    author_name: 'María Elena Rodríguez',
    author_email: 'investigador1@codecti.choco.gov.co',
    category_id: 1,
    category_name: 'Ciencia y Tecnología',
    category_slug: 'ciencia-tecnologia',
    status: 'published',
    is_featured: true,
    tags: [
      { id: 2, name: 'Biotecnología', slug: 'biotecnologia', created_at: '2025-01-01T00:00:00Z' },
      { id: 4, name: 'Sostenibilidad', slug: 'sostenibilidad', created_at: '2025-01-01T00:00:00Z' },
      { id: 7, name: 'Tecnologías Limpias', slug: 'tecnologias-limpias', created_at: '2025-01-01T00:00:00Z' }
    ],
    views_count: 892,
    published_at: '2025-01-12T14:30:00Z',
    created_at: '2025-01-12T14:00:00Z',
    updated_at: '2025-01-12T14:30:00Z'
  },
  {
    id: 3,
    title: 'Nueva especie de rana endémica descubierta en el Darién chocoano',
    slug: 'nueva-especie-rana-darien-choco',
    summary: 'Científicos del Instituto Humboldt y la UTCH confirman el hallazgo de una nueva especie de rana venenosa en las selvas del Darién, destacando la riqueza biológica única del Chocó.',
    content: `<p>Un equipo conjunto del Instituto Alexander von Humboldt y la Universidad Tecnológica del Chocó ha confirmado oficialmente el descubrimiento de una nueva especie de rana venenosa en las selvas del Darién chocoano, denominada científicamente <em>Phyllobates chocoensis</em>.</p>

<p>El hallazgo, resultado de cinco años de investigación sistemática en la región, representa el primer descubrimiento de una nueva especie de anfibio en el Chocó en la última década y subraya la extraordinaria biodiversidad que alberga este territorio.</p>

<h3>Características de la Especie</h3>
<p>La <em>Phyllobates chocoensis</em> presenta características únicas:</p>
<ul>
<li><strong>Coloración distintiva:</strong> Verde esmeralda con patrones dorados únicos</li>
<li><strong>Tamaño:</strong> Entre 2.5 y 3.2 centímetros de longitud</li>
<li><strong>Hábitat:</strong> Bosques húmedos tropicales entre 200 y 800 metros de altitud</li>
<li><strong>Toxinas:</strong> Alcaloides únicos con potencial farmacológico</li>
</ul>

<p>Los investigadores estiman que la población actual se encuentra entre 500 y 1.000 individuos, clasificándola como especie vulnerable que requiere medidas urgentes de conservación.</p>

<h3>Importancia Científica</h3>
<p>El Dr. Luis Fernando García, líder de la investigación, destaca que "este descubrimiento no solo enriquece nuestro conocimiento sobre la biodiversidad chocoana, sino que también abre nuevas oportunidades para la investigación biomédica, considerando las propiedades únicas de las toxinas de esta especie".</p>`,
    featured_image: '/static/news-rana-darien.jpg',
    author_id: 3,
    author_name: 'Carlos Alberto Mosquera',
    author_email: 'investigador2@codecti.choco.gov.co',
    category_id: 3,
    category_name: 'Biodiversidad',
    category_slug: 'biodiversidad',
    status: 'published',
    is_featured: false,
    tags: [
      { id: 3, name: 'Conservación', slug: 'conservacion', created_at: '2025-01-01T00:00:00Z' },
      { id: 2, name: 'Biotecnología', slug: 'biotecnologia', created_at: '2025-01-01T00:00:00Z' }
    ],
    views_count: 654,
    published_at: '2025-01-10T11:15:00Z',
    created_at: '2025-01-10T10:45:00Z',
    updated_at: '2025-01-10T11:15:00Z'
  },
  {
    id: 4,
    title: 'Comunidades emberá implementan sistema de energía solar comunitaria',
    slug: 'comunidades-embera-energia-solar',
    summary: 'Cinco resguardos emberá del Alto Baudó instalan sistemas fotovoltaicos comunitarios que beneficiarán a más de 200 familias con energía limpia y sostenible.',
    content: `<p>En una iniciativa histórica para el departamento, cinco resguardos emberá del Alto Baudó han logrado implementar exitosamente un sistema de energía solar comunitaria que beneficiará directamente a más de 200 familias indígenas.</p>

<p>El proyecto, desarrollado en alianza entre CODECTI Chocó, la Organización Regional Emberá Wounaan (OREWA) y la empresa social Energía Verde Colombia, representa un modelo innovador de desarrollo sostenible con enfoque étnico diferencial.</p>

<h3>Beneficios del Proyecto</h3>
<p>La implementación de este sistema ha generado múltiples beneficios:</p>
<ul>
<li><strong>Acceso a electricidad:</strong> 24 horas al día para todas las familias participantes</li>
<li><strong>Reducción de emisiones:</strong> Evita la emisión de 45 toneladas de CO2 anuales</li>
<li><strong>Ahorro económico:</strong> Eliminación del gasto en combustibles fósiles</li>
<li><strong>Fortalecimiento comunitario:</strong> Gestión autónoma del sistema energético</li>
</ul>

<h3>Tecnología Implementada</h3>
<p>El sistema cuenta con:</p>
<ul>
<li>120 paneles solares de alta eficiencia</li>
<li>Sistema de almacenamiento de 240 kWh</li>
<li>Red de distribución comunitaria de 2.5 km</li>
<li>Centro de control y monitoreo automatizado</li>
</ul>

<p>El líder emberá Juvenal Domicó expresó que "este proyecto no solo nos da luz, sino que fortalece nuestra autonomía y nos permite conservar nuestro territorio sin depender de combustibles que dañan la selva".</p>`,
    featured_image: '/static/news-energia-solar-embera.jpg',
    author_id: 1,
    author_name: 'Administrador CODECTI',
    author_email: 'admin@codecti.choco.gov.co',
    category_id: 4,
    category_name: 'Desarrollo Sostenible',
    category_slug: 'desarrollo-sostenible',
    status: 'published',
    is_featured: true,
    tags: [
      { id: 5, name: 'Energías Renovables', slug: 'energias-renovables', created_at: '2025-01-01T00:00:00Z' },
      { id: 9, name: 'Pueblos Indígenas', slug: 'pueblos-indigenas', created_at: '2025-01-01T00:00:00Z' },
      { id: 4, name: 'Sostenibilidad', slug: 'sostenibilidad', created_at: '2025-01-01T00:00:00Z' }
    ],
    views_count: 1108,
    published_at: '2025-01-08T16:20:00Z',
    created_at: '2025-01-08T15:50:00Z',
    updated_at: '2025-01-08T16:20:00Z'
  },
  {
    id: 5,
    title: 'Estudiantes chocoanos ganan concurso nacional de robótica con proyecto de manglares',
    slug: 'estudiantes-choco-robotica-manglares',
    summary: 'Un equipo de estudiantes de Quibdó desarrolla robot submarino para monitoreo de ecosistemas de manglar y obtiene el primer lugar en la Olimpiada Nacional de Robótica.',
    content: `<p>El equipo "Manglar Bot", conformado por seis estudiantes de instituciones educativas de Quibdó, obtuvo el primer lugar en la XVI Olimpiada Nacional de Robótica con su innovador proyecto de monitoreo submarino de ecosistemas de manglar.</p>

<p>El proyecto, mentoreado por ingenieros de CODECTI Chocó y docentes de la UTCH, desarrolló un robot submarino autónomo capaz de recolectar datos sobre calidad del agua, biodiversidad y estado de conservación de los manglares del Pacífico chocoano.</p>

<h3>Características del Robot</h3>
<p>El "Manglar Bot" incorpora tecnología de vanguardia:</p>
<ul>
<li><strong>Navegación autónoma:</strong> Sistema GPS y sensores de profundidad</li>
<li><strong>Sensores ambientales:</strong> pH, oxígeno disuelto, temperatura y turbidez</li>
<li><strong>Cámara submarina:</strong> Para registro de fauna y flora acuática</li>
<li><strong>Transmisión en tiempo real:</strong> Datos enviados vía WiFi a estación base</li>
</ul>

<p>La estudiante Yurley Mosquera, líder del equipo, explicó que "queríamos crear algo que realmente ayudara a proteger nuestros manglares. Sabemos que son súper importantes para las comunidades pesqueras y para enfrentar el cambio climático".</p>

<h3>Impacto y Reconocimientos</h3>
<p>El proyecto ha recibido múltiples reconocimientos:</p>
<ul>
<li>Primer lugar en Olimpiada Nacional de Robótica</li>
<li>Premio especial a la Innovación Social</li>
<li>Invitación al Foro Mundial de Jóvenes Científicos</li>
<li>Financiación para prototipo a escala real</li>
</ul>`,
    featured_image: '/static/news-robotica-manglares.jpg',
    author_id: 2,
    author_name: 'María Elena Rodríguez',
    author_email: 'investigador1@codecti.choco.gov.co',
    category_id: 5,
    category_name: 'Educación CTeI',
    category_slug: 'educacion-ctei',
    status: 'published',
    is_featured: false,
    tags: [
      { id: 3, name: 'Conservación', slug: 'conservacion', created_at: '2025-01-01T00:00:00Z' },
      { id: 6, name: 'Investigación Marina', slug: 'investigacion-marina', created_at: '2025-01-01T00:00:00Z' },
      { id: 7, name: 'Tecnologías Limpias', slug: 'tecnologias-limpias', created_at: '2025-01-01T00:00:00Z' }
    ],
    views_count: 743,
    published_at: '2025-01-06T13:45:00Z',
    created_at: '2025-01-06T13:15:00Z',
    updated_at: '2025-01-06T13:45:00Z'
  }
];

// Mock password hash for "password123"
const mockPasswordHash = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f';

// Mock database interface
export class MockDatabase {
  users: User[] = [...mockUsers];
  projects: Project[] = [...mockProjects];
  newsCategories: NewsCategory[] = [...mockNewsCategories];
  newsTags: NewsTag[] = [...mockNewsTags];
  newsArticles: NewsArticle[] = [...mockNewsArticles];
  // Store password hashes separately for dynamic users
  passwordHashes: Map<string, string> = new Map();
  nextUserId = 4;
  nextProjectId = 4;
  nextNewsId = 6;
  nextCategoryId = 6;
  nextTagId = 11;

  async getUserByEmail(email: string): Promise<any> {
    const user = this.users.find(u => u.email === email && u.is_active);
    if (!user) return null;
    
    // Check if we have a stored password hash for this email
    const storedPasswordHash = this.passwordHashes.get(email);
    
    return {
      ...user,
      password_hash: storedPasswordHash || mockPasswordHash // Use stored hash or fallback to mock
    };
  }

  async getUserById(id: number): Promise<User | null> {
    return this.users.find(u => u.id === id && u.is_active) || null;
  }

  async createUser(data: {
    name: string;
    email: string;
    institution: string;
    password_hash: string;
    role: 'admin' | 'collaborator' | 'researcher';
  }): Promise<User> {
    const now = new Date().toISOString();
    
    const user: User = {
      id: this.nextUserId++,
      email: data.email,
      name: data.name,
      institution: data.institution,
      role: data.role,
      created_at: now,
      is_active: true
    };
    
    // Store the password hash for this email
    this.passwordHashes.set(data.email, data.password_hash);
    
    this.users.push(user);
    return user;
  }

  async getProjects(search: string = '', status: string = '', sort: string = 'created_at', limit: number = 10, offset: number = 0): Promise<{ results: Project[], total: number }> {
    let filtered = [...this.projects];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.responsible_person.toLowerCase().includes(searchLower) ||
        p.summary.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (status && ['active', 'completed'].includes(status)) {
      filtered = filtered.filter(p => p.status === status);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'responsible_person':
          return a.responsible_person.localeCompare(b.responsible_person);
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    
    const total = filtered.length;
    const results = filtered.slice(offset, offset + limit);
    
    return { results, total };
  }

  async getProjectById(id: number): Promise<Project | null> {
    return this.projects.find(p => p.id === id) || null;
  }

  async createProject(data: {
    title: string;
    responsible_person: string;
    summary: string;
    status: 'active' | 'completed';
    created_by: number;
  }): Promise<Project> {
    const now = new Date().toISOString();
    const creator = this.users.find(u => u.id === data.created_by);
    
    const project: Project = {
      id: this.nextProjectId++,
      title: data.title,
      responsible_person: data.responsible_person,
      summary: data.summary,
      status: data.status,
      created_by: data.created_by,
      created_at: now,
      updated_at: now,
      creator_name: creator?.name || 'Usuario'
    };
    
    this.projects.push(project);
    return project;
  }

  async updateProject(id: number, updates: any): Promise<boolean> {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    this.projects[index] = {
      ...this.projects[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    return true;
  }

  // User management methods
  async getUsers(search: string = '', role: string = '', status: string = '', limit: number = 20, offset: number = 0): Promise<{ results: User[], total: number }> {
    let filtered = [...this.users];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        (u.institution && u.institution.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply role filter
    if (role && ['admin', 'collaborator', 'researcher'].includes(role)) {
      filtered = filtered.filter(u => u.role === role);
    }
    
    // Apply status filter
    if (status) {
      if (status === 'active') {
        filtered = filtered.filter(u => u.is_active);
      } else if (status === 'inactive') {
        filtered = filtered.filter(u => !u.is_active);
      }
    }
    
    const total = filtered.length;
    const results = filtered
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(offset, offset + limit);
    
    return { results, total };
  }

  async updateUser(id: number, updates: any): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    
    this.users[index] = {
      ...this.users[index],
      ...updates
    };
    
    // Update password hash if provided
    if (updates.password_hash) {
      this.passwordHashes.set(this.users[index].email, updates.password_hash);
    }
    
    return true;
  }

  async resetUserPassword(id: number, passwordHash: string): Promise<boolean> {
    const user = this.users.find(u => u.id === id);
    if (!user) return false;
    
    this.passwordHashes.set(user.email, passwordHash);
    return true;
  }

  async deactivateUser(id: number): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    
    this.users[index].is_active = false;
    return true;
  }

  // Public API methods (no authentication required)
  async getPublicProjects(
    search: string = '', 
    status: string = '', 
    area: string = '', 
    institution: string = '', 
    sort: string = 'created_at', 
    order: string = 'desc',
    limit: number = 12, 
    offset: number = 0
  ) {
    let filtered = [...this.projects].filter(project => {
      // Only show non-draft projects publicly
      if (project.status === 'draft') return false;
      
      if (search) {
        const searchLower = search.toLowerCase();
        const matches = 
          project.title.toLowerCase().includes(searchLower) ||
          project.summary.toLowerCase().includes(searchLower) ||
          (project.research_area && project.research_area.toLowerCase().includes(searchLower)) ||
          (project.institution && project.institution.toLowerCase().includes(searchLower)) ||
          (project.keywords && project.keywords.toLowerCase().includes(searchLower));
        if (!matches) return false;
      }
      
      if (status && project.status !== status) return false;
      if (area && (!project.research_area || !project.research_area.toLowerCase().includes(area.toLowerCase()))) return false;
      if (institution && (!project.institution || !project.institution.toLowerCase().includes(institution.toLowerCase()))) return false;
      
      return true;
    });

    // Sorting
    if (sort === 'title') {
      filtered.sort((a, b) => order === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));
    } else if (sort === 'start_date') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.start_date || a.created_at).getTime();
        const dateB = new Date(b.start_date || b.created_at).getTime();
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else {
      // Default: created_at
      filtered.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    const total = filtered.length;
    const projects = filtered.slice(offset, offset + limit).map(project => ({
      ...project,
      responsible_name: this.users.find(u => u.email === project.responsible_person)?.name || 'Usuario no encontrado'
    }));

    return { projects, total };
  }

  async getPublicProjectById(id: number) {
    const project = this.projects.find(p => p.id === id);
    if (!project || project.status === 'draft') return null;
    
    const responsible = this.users.find(u => u.email === project.responsible_person);
    
    return {
      ...project,
      responsible_name: responsible?.name || 'Usuario no encontrado',
      responsible_institution: responsible?.institution || 'Institución no encontrada'
    };
  }

  async getPublicStats() {
    const publicProjects = this.projects.filter(p => p.status !== 'draft');
    
    // Research areas count
    const researchAreas = new Map<string, number>();
    publicProjects.forEach(project => {
      if (project.research_area) {
        researchAreas.set(project.research_area, (researchAreas.get(project.research_area) || 0) + 1);
      }
    });

    // Institutions count
    const institutions = new Map<string, number>();
    publicProjects.forEach(project => {
      if (project.institution) {
        institutions.set(project.institution, (institutions.get(project.institution) || 0) + 1);
      }
    });

    return {
      totalProjects: publicProjects.length,
      activeProjects: publicProjects.filter(p => p.status === 'active').length,
      completedProjects: publicProjects.filter(p => p.status === 'completed').length,
      totalResearchers: this.users.filter(u => u.is_active).length,
      totalBudget: publicProjects.reduce((sum, p) => sum + (p.budget || 0), 0),
      researchAreas: Array.from(researchAreas.entries()).map(([area, count]) => ({
        research_area: area,
        count
      })).sort((a, b) => b.count - a.count).slice(0, 10),
      topInstitutions: Array.from(institutions.entries()).map(([institution, count]) => ({
        institution,
        count
      })).sort((a, b) => b.count - a.count).slice(0, 10)
    };
  }

  // HU-09: News/Blog System Methods

  // Categories management
  async getNewsCategories(): Promise<NewsCategory[]> {
    return [...this.newsCategories];
  }

  async getNewsCategoryById(id: number): Promise<NewsCategory | null> {
    return this.newsCategories.find(c => c.id === id) || null;
  }

  async getNewsCategoryBySlug(slug: string): Promise<NewsCategory | null> {
    return this.newsCategories.find(c => c.slug === slug) || null;
  }

  // Tags management
  async getNewsTags(): Promise<NewsTag[]> {
    return [...this.newsTags];
  }

  async getNewsTagById(id: number): Promise<NewsTag | null> {
    return this.newsTags.find(t => t.id === id) || null;
  }

  async getNewsTagsByIds(ids: number[]): Promise<NewsTag[]> {
    return this.newsTags.filter(t => ids.includes(t.id));
  }

  // News articles management (Admin)
  async getNewsArticles(
    search: string = '', 
    status: string = '', 
    category: string = '',
    author: string = '',
    sort: string = 'created_at', 
    order: string = 'desc',
    limit: number = 10, 
    offset: number = 0
  ) {
    let filtered = [...this.newsArticles];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchLower) ||
        article.summary.toLowerCase().includes(searchLower) ||
        (article.content && article.content.toLowerCase().includes(searchLower)) ||
        (article.author_name && article.author_name.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (status) {
      filtered = filtered.filter(article => article.status === status);
    }

    // Apply category filter
    if (category) {
      filtered = filtered.filter(article => 
        article.category_slug === category || article.category_name?.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Apply author filter
    if (author) {
      filtered = filtered.filter(article => 
        article.author_name?.toLowerCase().includes(author.toLowerCase()) ||
        article.author_email?.toLowerCase().includes(author.toLowerCase())
      );
    }

    // Apply sorting
    if (sort === 'title') {
      filtered.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        return order === 'asc' ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
      });
    } else if (sort === 'views') {
      filtered.sort((a, b) => {
        return order === 'asc' ? a.views_count - b.views_count : b.views_count - a.views_count;
      });
    } else if (sort === 'published_at') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.published_at || a.created_at).getTime();
        const dateB = new Date(b.published_at || b.created_at).getTime();
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else {
      // Default: created_at
      filtered.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    const total = filtered.length;
    const articles = filtered.slice(offset, offset + limit);

    return { articles, total };
  }

  async getNewsArticleById(id: number): Promise<NewsArticle | null> {
    return this.newsArticles.find(article => article.id === id) || null;
  }

  async getNewsArticleBySlug(slug: string): Promise<NewsArticle | null> {
    return this.newsArticles.find(article => article.slug === slug) || null;
  }

  async createNewsArticle(data: {
    title: string;
    summary: string;
    content: string;
    featured_image?: string;
    author_id: number;
    category_id: number;
    tag_ids: number[];
    status: 'draft' | 'published';
    is_featured: boolean;
    published_at?: string;
  }): Promise<NewsArticle> {
    const now = new Date().toISOString();
    const author = this.users.find(u => u.id === data.author_id);
    const category = this.newsCategories.find(c => c.id === data.category_id);
    const tags = this.newsTags.filter(t => data.tag_ids.includes(t.id));
    
    // Generate slug from title
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const article: NewsArticle = {
      id: this.nextNewsId++,
      title: data.title,
      slug: `${slug}-${this.nextNewsId - 1}`,
      summary: data.summary,
      content: data.content,
      featured_image: data.featured_image,
      author_id: data.author_id,
      author_name: author?.name || 'Usuario Desconocido',
      author_email: author?.email,
      category_id: data.category_id,
      category_name: category?.name || 'Sin Categoría',
      category_slug: category?.slug || 'sin-categoria',
      status: data.status,
      is_featured: data.is_featured,
      tags,
      views_count: 0,
      published_at: data.status === 'published' ? (data.published_at || now) : undefined,
      created_at: now,
      updated_at: now
    };

    this.newsArticles.unshift(article);
    return article;
  }

  async updateNewsArticle(id: number, data: {
    title: string;
    summary: string;
    content: string;
    featured_image?: string;
    category_id: number;
    tag_ids: number[];
    status: 'draft' | 'published' | 'archived';
    is_featured: boolean;
    published_at?: string;
  }): Promise<NewsArticle | null> {
    const articleIndex = this.newsArticles.findIndex(article => article.id === id);
    if (articleIndex === -1) return null;

    const article = this.newsArticles[articleIndex];
    const category = this.newsCategories.find(c => c.id === data.category_id);
    const tags = this.newsTags.filter(t => data.tag_ids.includes(t.id));
    const now = new Date().toISOString();

    // Generate new slug if title changed
    let slug = article.slug;
    if (data.title !== article.title) {
      slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() + `-${id}`;
    }

    const updatedArticle: NewsArticle = {
      ...article,
      title: data.title,
      slug,
      summary: data.summary,
      content: data.content,
      featured_image: data.featured_image,
      category_id: data.category_id,
      category_name: category?.name || 'Sin Categoría',
      category_slug: category?.slug || 'sin-categoria',
      status: data.status,
      is_featured: data.is_featured,
      tags,
      published_at: data.status === 'published' ? (data.published_at || article.published_at || now) : article.published_at,
      updated_at: now
    };

    this.newsArticles[articleIndex] = updatedArticle;
    return updatedArticle;
  }

  async deleteNewsArticle(id: number): Promise<boolean> {
    const articleIndex = this.newsArticles.findIndex(article => article.id === id);
    if (articleIndex === -1) return false;

    this.newsArticles.splice(articleIndex, 1);
    return true;
  }

  // Public news methods (for public portal)
  async getPublicNewsArticles(
    search: string = '', 
    category: string = '',
    tag: string = '',
    sort: string = 'published_at', 
    order: string = 'desc',
    limit: number = 12, 
    offset: number = 0
  ) {
    // Only show published articles
    let filtered = this.newsArticles.filter(article => article.status === 'published');

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchLower) ||
        article.summary.toLowerCase().includes(searchLower) ||
        (article.category_name && article.category_name.toLowerCase().includes(searchLower)) ||
        article.tags.some(tag => tag.name.toLowerCase().includes(searchLower))
      );
    }

    // Apply category filter
    if (category) {
      filtered = filtered.filter(article => 
        article.category_slug === category || 
        (article.category_name && article.category_name.toLowerCase().includes(category.toLowerCase()))
      );
    }

    // Apply tag filter
    if (tag) {
      filtered = filtered.filter(article => 
        article.tags.some(t => t.slug === tag || t.name.toLowerCase().includes(tag.toLowerCase()))
      );
    }

    // Apply sorting
    if (sort === 'title') {
      filtered.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        return order === 'asc' ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
      });
    } else if (sort === 'views') {
      filtered.sort((a, b) => {
        return order === 'asc' ? a.views_count - b.views_count : b.views_count - a.views_count;
      });
    } else if (sort === 'published_at') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.published_at || a.created_at).getTime();
        const dateB = new Date(b.published_at || b.created_at).getTime();
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    const total = filtered.length;
    const articles = filtered.slice(offset, offset + limit).map(article => ({
      ...article,
      tags: article.tags.map(t => t.name)
    }));

    return { articles, total };
  }

  async getPublicNewsArticleBySlug(slug: string): Promise<any | null> {
    const article = this.newsArticles.find(a => a.slug === slug && a.status === 'published');
    if (!article) return null;

    // Increment views count
    article.views_count++;

    return {
      ...article,
      tags: article.tags.map(t => t.name)
    };
  }

  async getFeaturedNewsArticles(limit: number = 3): Promise<any[]> {
    return this.newsArticles
      .filter(article => article.status === 'published' && article.is_featured)
      .sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime())
      .slice(0, limit)
      .map(article => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        featured_image: article.featured_image,
        author_name: article.author_name,
        category_name: article.category_name,
        category_slug: article.category_slug,
        published_at: article.published_at,
        views_count: article.views_count,
        tags: article.tags.map(t => t.name).slice(0, 3)
      }));
  }

  async getRecentNewsArticles(limit: number = 5): Promise<any[]> {
    return this.newsArticles
      .filter(article => article.status === 'published')
      .sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime())
      .slice(0, limit)
      .map(article => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        author_name: article.author_name,
        category_name: article.category_name,
        published_at: article.published_at,
        views_count: article.views_count
      }));
  }

  async getNewsStats(): Promise<any> {
    const publishedArticles = this.newsArticles.filter(article => article.status === 'published');
    
    // Categories stats
    const categoriesStats = new Map<string, number>();
    publishedArticles.forEach(article => {
      if (article.category_name) {
        categoriesStats.set(article.category_name, (categoriesStats.get(article.category_name) || 0) + 1);
      }
    });

    // Tags stats
    const tagsStats = new Map<string, number>();
    publishedArticles.forEach(article => {
      article.tags.forEach(tag => {
        tagsStats.set(tag.name, (tagsStats.get(tag.name) || 0) + 1);
      });
    });

    return {
      totalArticles: publishedArticles.length,
      featuredArticles: publishedArticles.filter(a => a.is_featured).length,
      totalViews: publishedArticles.reduce((sum, article) => sum + article.views_count, 0),
      totalCategories: this.newsCategories.length,
      totalTags: this.newsTags.length,
      topCategories: Array.from(categoriesStats.entries()).map(([name, count]) => ({
        name, count
      })).sort((a, b) => b.count - a.count).slice(0, 5),
      topTags: Array.from(tagsStats.entries()).map(([name, count]) => ({
        name, count
      })).sort((a, b) => b.count - a.count).slice(0, 10)
    };
  }
}

// Singleton instance
export const mockDb = new MockDatabase();

// Initialize password hashes for existing mock users
mockDb.passwordHashes.set('admin@codecti.choco.gov.co', mockPasswordHash);
mockDb.passwordHashes.set('investigador1@codecti.choco.gov.co', mockPasswordHash);
mockDb.passwordHashes.set('investigador2@codecti.choco.gov.co', mockPasswordHash);