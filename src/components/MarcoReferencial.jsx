import React, { useState } from 'react';
import { BookOpen, AlertCircle, ArrowRight, HelpCircle, Lightbulb, Search, Database, Quote, Shield, Layers, ExternalLink, Clock, FileText, Landmark, MapPin, Scale } from 'lucide-react';
import { generateAntecedentesStructure, generateMarcoTeoricoStructure, generateMarcoConceptualStructure, generateMarcoContextualStructure, suggestTheoriesForTitle, suggestConceptsForTitle, generateMarcoLegalStructure, suggestNormsForTitle } from '../services/groqService';

const MarcoReferencial = () => {
    const [activeCitationType, setActiveCitationType] = useState('parafrasis');
    const [activeMarcoTab, setActiveMarcoTab] = useState('antecedentes');
    const [antecedentesTitle, setAntecedentesTitle] = useState('');
    const [antecedentesResult, setAntecedentesResult] = useState('');
    const [isGeneratingAntecedentes, setIsGeneratingAntecedentes] = useState(false);
    const [antecedentesError, setAntecedentesError] = useState('');
    const [teoricoTitle, setTeoricoTitle] = useState('');
    const [teoricoResult, setTeoricoResult] = useState('');
    const [isGeneratingTeorico, setIsGeneratingTeorico] = useState(false);
    const [teoricoError, setTeoricoError] = useState('');
    const [conceptualTitle, setConceptualTitle] = useState('');
    const [conceptualResult, setConceptualResult] = useState('');
    const [isGeneratingConceptual, setIsGeneratingConceptual] = useState(false);
    const [conceptualError, setConceptualError] = useState('');
    const [suggestedConceptsTitle, setSuggestedConceptsTitle] = useState('');
    const [suggestedConceptsResult, setSuggestedConceptsResult] = useState('');
    const [isGeneratingConcepts, setIsGeneratingConcepts] = useState(false);
    const [conceptsError, setConceptsError] = useState('');
    const [suggestedTheoriesTitle, setSuggestedTheoriesTitle] = useState('');
    const [suggestedTheoriesResult, setSuggestedTheoriesResult] = useState('');
    const [isGeneratingTheories, setIsGeneratingTheories] = useState(false);
    const [theoriesError, setTheoriesError] = useState('');
    const [contextualTitle, setContextualTitle] = useState('');
    const [contextualResult, setContextualResult] = useState('');
    const [isGeneratingContextual, setIsGeneratingContextual] = useState(false);
    const [contextualError, setContextualError] = useState('');
    const [legalTitle, setLegalTitle] = useState('');
    const [legalResult, setLegalResult] = useState('');
    const [isGeneratingLegal, setIsGeneratingLegal] = useState(false);
    const [legalError, setLegalError] = useState('');
    const [suggestedNormsTitle, setSuggestedNormsTitle] = useState('');
    const [suggestedNormsResult, setSuggestedNormsResult] = useState('');
    const [isGeneratingNorms, setIsGeneratingNorms] = useState(false);
    const [normsError, setNormsError] = useState('');

    const handleGenerateAntecedentes = async () => {
        if (!antecedentesTitle.trim()) {
            setAntecedentesError('Por favor ingresa el título de tu investigación');
            return;
        }
        setIsGeneratingAntecedentes(true);
        setAntecedentesError('');
        try {
            const result = await generateAntecedentesStructure(antecedentesTitle);
            setAntecedentesResult(result);
        } catch (err) {
            console.error('Error generating antecedentes:', err);
            setAntecedentesError(err.message || 'Error al generar la guía');
        } finally {
            setIsGeneratingAntecedentes(false);
        }
    };

    const handleGenerateTeorico = async () => {
        if (!teoricoTitle.trim()) {
            setTeoricoError('Por favor ingresa el título de tu investigación');
            return;
        }
        setIsGeneratingTeorico(true);
        setTeoricoError('');
        try {
            const result = await generateMarcoTeoricoStructure(teoricoTitle);
            setTeoricoResult(result);
        } catch (err) {
            console.error('Error generating marco teórico:', err);
            setTeoricoError(err.message || 'Error al generar la guía');
        } finally {
            setIsGeneratingTeorico(false);
        }
    };

    const handleGenerateConceptual = async () => {
        if (!conceptualTitle.trim()) {
            setConceptualError('Por favor ingresa el título de tu investigación');
            return;
        }
        setIsGeneratingConceptual(true);
        setConceptualError('');
        try {
            const result = await generateMarcoConceptualStructure(conceptualTitle);
            setConceptualResult(result);
        } catch (err) {
            console.error('Error generating marco conceptual:', err);
            setConceptualError(err.message || 'Error al generar la guía');
        } finally {
            setIsGeneratingConceptual(false);
        }
    };

    const handleGenerateContextual = async () => {
        if (!contextualTitle.trim()) {
            setContextualError('Por favor ingresa el título de tu investigación');
            return;
        }
        setIsGeneratingContextual(true);
        setContextualError('');
        try {
            const result = await generateMarcoContextualStructure(contextualTitle);
            setContextualResult(result);
        } catch (err) {
            console.error('Error generating marco contextual:', err);
            setContextualError(err.message || 'Error al generar la guía');
        } finally {
            setIsGeneratingContextual(false);
        }
    };

    const handleSuggestConcepts = async () => {
        if (!suggestedConceptsTitle.trim()) {
            setConceptsError('Por favor ingresa un título para sugerir conceptos');
            return;
        }
        setIsGeneratingConcepts(true);
        setConceptsError('');
        try {
            const result = await suggestConceptsForTitle(suggestedConceptsTitle);
            setSuggestedConceptsResult(result);
        } catch (err) {
            console.error('Error suggesting concepts:', err);
            setConceptsError(err.message || 'Error al sugerir conceptos');
        } finally {
            setIsGeneratingConcepts(false);
        }
    };

    const handleGenerateLegal = async () => {
        if (!legalTitle.trim()) {
            setLegalError('Por favor ingresa el título de tu investigación');
            return;
        }
        setIsGeneratingLegal(true);
        setLegalError('');
        try {
            const result = await generateMarcoLegalStructure(legalTitle);
            setLegalResult(result);
        } catch (err) {
            console.error('Error generating marco legal:', err);
            setLegalError(err.message || 'Error al generar la guía');
        } finally {
            setIsGeneratingLegal(false);
        }
    };

    const handleSuggestNorms = async () => {
        if (!suggestedNormsTitle.trim()) {
            setNormsError('Por favor ingresa un título para sugerir normativas');
            return;
        }
        setIsGeneratingNorms(true);
        setNormsError('');
        try {
            const result = await suggestNormsForTitle(suggestedNormsTitle);
            setSuggestedNormsResult(result);
        } catch (err) {
            console.error('Error suggesting norms:', err);
            setNormsError(err.message || 'Error al sugerir normativas');
        } finally {
            setIsGeneratingNorms(false);
        }
    };

    const handleSuggestTheories = async () => {
        if (!suggestedTheoriesTitle.trim()) {
            setTheoriesError('Por favor ingresa un título para sugerir teorías');
            return;
        }
        setIsGeneratingTheories(true);
        setTheoriesError('');
        try {
            const result = await suggestTheoriesForTitle(suggestedTheoriesTitle);
            setSuggestedTheoriesResult(result);
        } catch (err) {
            console.error('Error suggesting theories:', err);
            setTheoriesError(err.message || 'Error al sugerir teorías');
        } finally {
            setIsGeneratingTheories(false);
        }
    };

    const marcoTabs = [
        {
            id: 'antecedentes',
            label: 'Antecedentes',
            icon: Clock,
            color: '#0369a1',
            bgGradient: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)',
            border: '#bae6fd',
            description: 'Los antecedentes constituyen una revisión de las investigaciones previas relacionadas con el tema de estudio. Se trata de un recorrido por los trabajos más relevantes que se han realizado sobre el problema o fenómeno que se pretende investigar, tanto a nivel internacional, nacional como local.',
            elements: [
                'Investigaciones previas relevantes (últimos 5-10 años)',
                'Resultados y conclusiones de estudios anteriores',
                'Metodologías utilizadas en investigaciones similares',
                'Vacíos o brechas identificadas en estudios previos',
                'Evolución histórica del problema de investigación'
            ],
            tips: 'Organice los antecedentes de lo general a lo específico (internacional → nacional → local). Cada antecedente debe incluir: autor(es), año, objetivo, metodología, resultados principales y cómo se relaciona con su investigación. Utilice fuentes de los últimos 5 a 10 años preferiblemente.',
            searchGuide: {
                title: '¿Dónde y cómo buscar antecedentes?',
                steps: [
                    { step: '1. Defina palabras clave', detail: 'Extraiga los términos principales de su título de investigación (variables, población, contexto). Tradúzcalos al inglés para ampliar la búsqueda.' },
                    { step: '2. Use operadores de búsqueda', detail: 'Combine palabras con AND, OR y comillas: "aprendizaje colaborativo" AND "rendimiento académico". Esto filtra resultados más precisos.' },
                    { step: '3. Filtre por fecha y tipo', detail: 'Limite a los últimos 5-10 años. Priorice artículos de revistas indexadas, tesis doctorales y libros de editoriales reconocidas.' },
                    { step: '4. Lea el abstract primero', detail: 'Antes de leer completo, revise el resumen para verificar que el estudio es realmente relevante para su investigación.' },
                    { step: '5. Organice sus hallazgos', detail: 'Use un gestor bibliográfico (Mendeley, Zotero) para guardar y organizar las fuentes encontradas desde el inicio.' },
                ],
                databases: [
                    { name: 'Google Scholar', url: 'https://scholar.google.com', tip: 'Mayor cobertura. Use "Citado por" para encontrar estudios relacionados.' },
                    { name: 'Scielo', url: 'https://scielo.org', tip: 'Excelente para investigaciones de América Latina y el Caribe.' },
                    { name: 'Redalyc', url: 'https://www.redalyc.org', tip: 'Acceso abierto a revistas iberoamericanas.' },
                    { name: 'Dialnet', url: 'https://dialnet.unirioja.es', tip: 'Tesis doctorales y artículos en español.' },
                    { name: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov', tip: 'Ideal para ciencias de la salud y biomedicina.' },
                    { name: 'DOAJ', url: 'https://doaj.org', tip: 'Directorio de revistas de acceso abierto verificadas.' },
                ]
            }
        },
        {
            id: 'teorico',
            label: 'Marco Teórico',
            icon: BookOpen,
            color: '#7c3aed',
            bgGradient: 'linear-gradient(to bottom right, #f5f3ff, #ede9fe)',
            border: '#ddd6fe',
            description: 'El marco teórico presenta las teorías, modelos y enfoques que fundamentan la investigación. Es la base conceptual sobre la cual se sustenta el estudio, proporcionando el soporte científico necesario para comprender el fenómeno investigado y orientar el diseño metodológico.',
            elements: [
                'Teorías principales que sustentan la investigación',
                'Modelos teóricos aplicables al problema',
                'Posturas de autores representativos del área',
                'Relación entre las teorías y las variables del estudio',
                'Contribuciones e inconsistencias teóricas encontradas'
            ],
            tips: 'No se limite a describir teorías; realice un análisis crítico comparando posturas, identificando convergencias y divergencias. Vincule cada teoría con su problema de investigación. Prefiera fuentes primarias (artículos originales) sobre fuentes secundarias (manuales o resúmenes).',
            searchGuide: {
                title: '¿Dónde y cómo buscar teorías para el marco teórico?',
                steps: [
                    { step: '1. Identifique las variables', detail: 'Extraiga las variables o categorías principales de su título. Cada variable tiene teorías que la explican; búsquelas independientemente.' },
                    { step: '2. Busque revisión de literatura', detail: 'Use términos como "revisión teórica", "theoretical review", "literature review" junto con sus variables para encontrar artículos de revisión.' },
                    { step: '3. Identifique autores clave', detail: 'En los primeros artículos encontrados, observe qué autores se citan repetidamente. Esos son los referentes teóricos del área.' },
                    { step: '4. Lea las fuentes originales', detail: 'Una vez identificados los autores clave, busque sus publicaciones originales (fuentes primarias). Evite citar solo manuales o resúmenes.' },
                    { step: '5. Compare y analice críticamente', detail: 'No solo describa las teorías; contraste posturas, identifique coincidencias, divergencias y vacíos teóricos relevantes para su estudio.' },
                ],
                databases: [
                    { name: 'Google Scholar', url: 'https://scholar.google.com', tip: 'Busque "theoretical framework" + su tema. Use "Citado por" para encontrar teorías fundamentales.' },
                    { name: 'Scielo', url: 'https://scielo.org', tip: 'Artículos de revisión teórica en español y portugués de Latinoamérica.' },
                    { name: 'ResearchGate', url: 'https://www.researchgate.net', tip: 'Acceso directo a publicaciones de autores; puede solicitar artículos de texto completo.' },
                    { name: 'Semantic Scholar', url: 'https://www.semanticscholar.org', tip: 'IA para encontrar artículos influyentes y mapear conexiones teóricas.' },
                    { name: 'Redalyc', url: 'https://www.redalyc.org', tip: 'Revistas iberoamericanas con marcos teóricos bien fundamentados.' },
                    { name: 'JSTOR', url: 'https://www.jstor.org', tip: 'Textos clásicos y publicaciones históricas de teorías fundamentales.' },
                ]
            }
        },
        {
            id: 'conceptual',
            label: 'Marco Conceptual',
            icon: Layers,
            color: '#059669',
            bgGradient: 'linear-gradient(to bottom right, #ecfdf5, #d1fae5)',
            border: '#6ee7b7',
            description: 'El marco conceptual define y operacionaliza los conceptos, variables y categorías centrales de la investigación. Establece las definiciones que el investigador adopta para cada término clave, diferenciando entre definiciones conceptuales (teóricas) y operacionales (medibles o aplicables).',
            elements: [
                'Definición conceptual de cada variable o categoría',
                'Definición operacional de las variables (cómo se medirán)',
                'Relaciones entre las variables o categorías',
                'Indicadores y dimensiones de cada variable',
                'Diagrama o esquema de relaciones conceptuales'
            ],
            tips: 'Cada concepto clave debe tener al menos dos fuentes que lo respalden. Use definiciones de autores reconocidos en el área y, cuando sea pertinente, presente su propia definición operacional. Puede incluir un mapa conceptual o diagrama que muestre las relaciones entre variables.',
            searchGuide: {
                title: '¿Dónde y cómo buscar conceptos para el marco conceptual?',
                steps: [
                    { step: '1. Extraiga conceptos clave', detail: 'Identifique los términos principales de su pregunta de investigación y objetivos. Estos formarán la base de su marco.' },
                    { step: '2. Busque definiciones formales', detail: 'Utilice diccionarios especializados, enciclopedias temáticas y libros de texto reconocidos en su área de estudio.' },
                    { step: '3. Revise artículos de revisión conceptual', detail: 'Busque artículos que se dediquen a definir y debatir conceptos específicos (términos como "concept analysis", "definición", "revisión").' },
                    { step: '4. Compare definiciones', detail: 'No se quede con la primera definición. Compare cómo distintos autores entienden el mismo concepto.' },
                    { step: '5. Construya su propia definición', detail: 'A partir de las fuentes consultadas, construya una definición de trabajo (operacional) que se ajuste a su investigación específica.' },
                ],
                databases: [
                    { name: 'Google Scholar', url: 'https://scholar.google.com', tip: 'Busque "concept of" o "definición de" + su término.' },
                    { name: 'Scielo', url: 'https://scielo.org', tip: 'Artículos de revisión conceptual en español y portugués.' },
                    { name: 'Redalyc', url: 'https://www.redalyc.org', tip: 'Revistas de ciencias sociales con fuertes bases conceptuales.' },
                    { name: 'Dialnet', url: 'https://dialnet.unirioja.es', tip: 'Artículos y tesis conceptuales en español.' },
                    { name: 'JSTOR', url: 'https://www.jstor.org', tip: 'Útil para rastrear la evolución histórica de un concepto.' },
                ]
            }
        },
        {
            id: 'contextual',
            label: 'Marco Contextual',
            icon: MapPin,
            color: '#d97706',
            bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7)',
            border: '#fde68a',
            description: 'El marco contextual describe el entorno, situación o realidad específica en la que se desarrolla la investigación. Caracteriza el contexto geográfico, social, económico, cultural o institucional donde se ubica el problema y donde se llevará a cabo el estudio.',
            elements: [
                'Ubicación geográfica y características del lugar',
                'Contexto social, económico o cultural relevante',
                'Descripción de la institución u organización (si aplica)',
                'Población y sus características principales',
                'Condiciones actuales que rodean el problema'
            ],
            tips: 'Sea específico y use datos verificables (estadísticas oficiales, informes institucionales, censos). Describa solo los aspectos del contexto que son relevantes para su investigación. Incluya datos recientes que permitan al lector comprender la realidad donde se sitúa el estudio.',
            searchGuide: {
                title: '¿Dónde y cómo buscar información para el marco contextual?',
                steps: [
                    { step: '1. Identifique el alcance espacial', detail: 'Defina qué nivel de contexto necesita: internacional, nacional, regional, municipal o institucional.' },
                    { step: '2. Busque datos oficiales y estadísticos', detail: 'Utilice las páginas de los ministerios, secretarías locales o institutos nacionales de estadística (ej: DANE en Colombia).' },
                    { step: '3. Revise informes institucionales', detail: 'Si aplica a una empresa o colegio, revise sus PEI, estatutos, planes de desarrollo o balances de gestión.' },
                    { step: '4. Agrupe por dimensiones', detail: 'Organice la información en dimensiones claras: demográfica, económica, social, cultural y tecnológica.' },
                    { step: '5. Conecte el contexto con el problema', detail: 'No solo describa el lugar; explique cómo las características de ese lugar propician o afectan el problema investigado.' },
                ],
                databases: [
                    { name: 'Institutos de Estadística', url: 'https://www.dane.gov.co', tip: 'Entidades gubernamentales para obtener datos demográficos y económicos.' },
                    { name: 'Ministerios e Instituciones', url: '#', tip: 'Portales oficiales para políticas, diagnósticos sectoriales y reportes de alcance nacional.' },
                    { name: 'ECLAC / CEPAL', url: 'https://www.cepal.org/es', tip: 'Excelente para estadísticas socioeconómicas de América Latina.' },
                    { name: 'Bancos Multilaterales', url: 'https://data.worldbank.org/indicator', tip: 'Datos del Banco Mundial, BID, que proporcionan estudios de la región.' },
                    { name: 'Observatorios Locales', url: '#', tip: 'Portales municipales o departamentales para indicadores específicos de su localidad.' },
                ]
            }
        },
        {
            id: 'legal',
            label: 'Marco Legal',
            icon: Scale,
            color: '#dc2626',
            bgGradient: 'linear-gradient(to bottom right, #fef2f2, #fee2e2)',
            border: '#fca5a5',
            description: 'El marco legal recopila y analiza las normas jurídicas, leyes, decretos y resoluciones que regulan, enmarcan o afectan directa e indirectamente el objeto de investigación.',
            elements: [
                'Constitución Nacional y tratados internacionales',
                'Leyes orgánicas y estatutarias',
                'Decretos y acuerdos resolutivos',
                'Jurisprudencia relevante',
                'Normativas institucionales locales'
            ],
            tips: 'Siga la pirámide de Kelsen: comience con las normas de mayor jerarquía (Constitución) y baje hacia las más específicas (resoluciones locales). No basta con citar la norma; debe explicar cómo aplica específicamente a su proyecto y por qué restringe o posibilita lo que está investigando.',
            searchGuide: {
                title: '¿Dónde y cómo buscar información para el marco legal?',
                steps: [
                    { step: '1. Aplique la Pirámide de Kelsen', detail: 'Defina y busque desde lo macro (Constitución) hasta lo micro (Acuerdos Locales).' },
                    { step: '2. Bases gubernamentales oficiales', detail: 'Consulte portales oficiales como el Diario Oficial o gacetas del Congreso.' },
                    { step: '3. Buscadores y repositorios jurídicos', detail: 'Utilice herramientas gratuitas o suscritas como vLex, LexBase o la página de la Corte Constitucional.' },
                    { step: '4. Vigencia de la norma', detail: 'Revise siempre que la norma esté vigente, no drogada, y busque la última actualización o jurisprudencia.' },
                    { step: '5. Cite y analice', detail: 'Aparte de citarla correctamente, relate expresamente cómo dicho artículo afecta o regula su objeto de estudio.' },
                ],
                databases: [
                    { name: 'vLex', url: 'https://vlex.com', tip: 'Plataforma con legislación, jurisprudencia y doctrina a nivel global (varias universidades tienen acceso).' },
                    { name: 'Corte Constitucional / Supremas', url: 'https://www.corteconstitucional.gov.co/', tip: 'Ideal para buscar sentencias de unificación y revisión constitucional.' },
                    { name: 'Diario Oficial / SUIN', url: 'https://www.suin-juriscol.gov.co/', tip: 'Sistema Único de Información Normativa (ej. Colombia) para consultar la vigencia de las leyes.' },
                    { name: 'LexBase', url: 'https://www.lexbase.com/', tip: 'Herramienta de búsqueda para normativas y jurisprudencia clasificada.' },
                    { name: 'Páginas web ministeriales', url: '#', tip: 'Para decretos y resoluciones muy aplicables a un sector (Ej: MinEducación, MinAmbiente).' },
                ]
            }
        },
    ];

    const activeMarcoData = marcoTabs.find(t => t.id === activeMarcoTab);

    const citationTypes = [
        {
            id: 'parafrasis',
            label: 'Paráfrasis',
            description: 'Frase no textual adaptada con las palabras de quien escribe. Es la forma de citación más adecuada en textos académicos; demuestra lectura, análisis y redacción propia.',
            examples: [
                { label: 'Un autor', example: '(Arango, 2000)' },
                { label: 'Dos autores', example: '(Ramírez H. & Guzmán, s.f.)' },
                { label: 'Tres o más autores', example: '(Baker et al., 2002)' },
                { label: 'Sin fecha', example: '(Ramírez H. & Guzmán, s.f.)' },
                { label: 'Múltiples fuentes', example: '(Fundéu; Hooper, 2010; IEEE, 2006)' },
            ]
        },
        {
            id: 'textual_corta',
            label: 'Textual < 40 palabras',
            description: 'Cita textual menor a 40 palabras, se coloca al interior del párrafo entre comillas. No utilice recurrentemente esta forma, pues demuestra poco análisis y redacción propios.',
            examples: [
                { label: 'Un autor', example: '"cita textual" (Arango, 2000, p. 466)' },
                { label: 'Dos autores', example: '"cita textual" (Ramírez H. & Guzmán, 2015, p. 2)' },
                { label: 'Tres o más', example: '"cita textual" (Baker et al., 2002, p. 1281)' },
                { label: 'Sitio web (párr.)', example: '"cita textual" (El Espectador, 2012, párr. 9)' },
                { label: 'Páginas continuas', example: '"cita textual" (Rioja, 2008, pp. 15-16)' },
                { label: 'Páginas discontinuas', example: '"cita textual" (González Pérez et al., 2006, pp. 15, 17)' },
                { label: 'Fragmentos omitidos', example: '"texto (…) texto" (Ruiz Rojas, 2014, p. 45)' },
            ]
        },
        {
            id: 'textual_larga',
            label: 'Textual ≥ 40 palabras',
            description: 'Cita textual mayor a 40 palabras. Se presenta en bloque aparte, sin comillas, con sangría de 1.27 cm en todo el párrafo. Al final se coloca el punto antes de la referencia parentética.',
            examples: [
                {
                    label: 'Formato de bloque',
                    example: `     Por su parte, la necesidad de persuadir conduce a pensar el material probatorio dependiendo del ánimo de quien escucha. En síntesis, el componente lógico se fundamenta en la selección de argumentos verosímiles, lo cual conduce directamente al componente dialéctico de la argumentación en tanto la parte psicológica remite a un aspecto discursivo. (Ruiz Rojas, 2014, p. 107)`,
                    isBlock: true
                },
            ]
        },
        {
            id: 'cita_cita',
            label: 'Cita de cita',
            description: 'Cuando se cita a un autor que fue citado por otro autor. Se utiliza cuando no se tiene acceso a la fuente original.',
            examples: [
                { label: 'Paráfrasis', example: '(Quintero & González, 1997, citados por Rioja, 2008)' },
                { label: 'Textual', example: '"cita textual" (Quintero & González, 1997, citados por Rioja, 2008, p. 36)' },
            ]
        },
        {
            id: 'corporativo',
            label: 'Autor Corporativo',
            description: 'Organizaciones, instituciones o entidades como autores. La primera vez se escribe el nombre completo con la sigla entre corchetes; las veces siguientes solo la sigla.',
            examples: [
                { label: 'Sin sigla reconocible', example: '(Corporación Unificada Nacional, 2016)' },
                { label: 'Primera cita con sigla', example: '(International Business Machine [IBM], 2013)' },
                { label: 'Citas subsiguientes', example: '(IBM, 2013)' },
            ]
        },
        {
            id: 'comunicacion',
            label: 'Comunicación Personal',
            description: 'Cartas, memorandos, correos electrónicos, conversaciones telefónicas, entrevistas y otras fuentes inéditas. Se citan en el texto, pero NO se incluyen en las referencias.',
            examples: [
                { label: 'Formato', example: '(J. C. Ramírez, comunicación personal, 4 de julio, 2020)' },
            ]
        },
    ];

    const activeType = citationTypes.find(t => t.id === activeCitationType);

    const academicSources = [
        { name: 'Google Scholar', url: 'https://scholar.google.com', color: '#4285f4', desc: 'Buscador académico de Google' },
        { name: 'Redalyc', url: 'https://www.redalyc.org', color: '#c0392b', desc: 'Red de Revistas de América Latina' },
        { name: 'Scielo', url: 'https://scielo.org', color: '#27ae60', desc: 'Biblioteca Electrónica Científica' },
        { name: 'Dialnet', url: 'https://dialnet.unirioja.es', color: '#8e44ad', desc: 'Portal bibliográfico hispano' },
        { name: 'DOAJ', url: 'https://doaj.org', color: '#e67e22', desc: 'Directory of Open Access Journals' },
        { name: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov', color: '#2980b9', desc: 'Biomedicina y Ciencias de la Salud' },
        { name: 'BASE Search', url: 'https://www.base-search.net', color: '#16a085', desc: 'Bielefeld Academic Search Engine' },
        { name: 'Google Books', url: 'https://books.google.com', color: '#f39c12', desc: 'Libros académicos digitalizados' },
    ];

    return (
        <div style={{ maxWidth: '100%', paddingBottom: '3rem' }}>

            {/* Main Theory Card */}
            <div className="responsive-banner" style={{
                background: 'linear-gradient(to right, #fef3c7, #fde68a)',
                border: '1px solid #f59e0b',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2.5rem',
                display: 'flex',
                gap: '2rem',
                alignItems: 'start'
            }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#92400e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={28} />
                        ¿Qué es el Marco Referencial?
                    </h2>
                    <p style={{ color: '#78350f', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '1rem' }}>
                        El marco referencial desarrolla las <strong>contribuciones e inconsistencias teóricas</strong> que se constituyen
                        en referentes para el diseño metodológico y el análisis del corpus documental. Describe lo que se sabe del
                        objeto de la investigación o el soporte teórico de la situación a intervenir.
                    </p>
                    <p style={{ color: '#78350f', lineHeight: '1.7', fontSize: '1.05rem' }}>
                        Debe ser producto de una <strong>revisión de teorías representativas</strong>, en busca de fundamentación
                        que permita soportar y/o contrastar los resultados. Se estructura por títulos y subtítulos en
                        máximo <strong>5 páginas</strong>, siguiendo las Normas APA 7.ª edición.
                    </p>
                </div>
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    maxWidth: '320px',
                    width: '100%'
                }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309', marginBottom: '0.75rem', fontSize: '1rem' }}>
                        <Lightbulb size={20} /> Elementos Clave
                    </h4>
                    <ul style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', paddingLeft: '1.25rem', margin: 0 }}>
                        <li style={{ marginBottom: '0.5rem' }}>Identificación de <strong>variables y categorías</strong></li>
                        <li style={{ marginBottom: '0.5rem' }}>Análisis <strong>crítico</strong> de las fuentes</li>
                        <li style={{ marginBottom: '0.5rem' }}>Fuentes <strong>recientes y de calidad</strong></li>
                        <li style={{ marginBottom: '0.5rem' }}>Observación, descripción y <strong>explicación</strong></li>
                        <li>Conocimiento <strong>científico</strong> vigente</li>
                    </ul>
                </div>
            </div>

            {/* Three Core Components */}
            <div className="responsive-flex-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>

                {/* Card: Marco Teórico */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)',
                    border: '1px solid #bae6fd',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#0369a1', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={22} color="#0ea5e9" />
                        Marco Teórico
                    </h3>
                    <p style={{ color: '#0c4a6e', fontSize: '0.92rem', lineHeight: '1.65', margin: 0 }}>
                        Revisión de las <strong>teorías representativas</strong> que dan soporte conceptual a la investigación.
                        Incluye antecedentes, estado del arte y las contribuciones de autores clave que permiten
                        fundamentar el estudio.
                    </p>
                </div>

                {/* Card: Variables y Categorías */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #f5f3ff, #ede9fe)',
                    border: '1px solid #ddd6fe',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#6b21a8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Layers size={22} color="#a855f7" />
                        Variables y Categorías
                    </h3>
                    <p style={{ color: '#581c87', fontSize: '0.92rem', lineHeight: '1.65', margin: 0 }}>
                        Identificación de las <strong>variables y categorías</strong> que permean la investigación.
                        Cada variable debe ser definida conceptual y operacionalmente, vinculándola con los
                        referentes teóricos seleccionados.
                    </p>
                </div>

                {/* Card: Análisis Crítico */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)',
                    border: '1px solid #bbf7d0',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#166534', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Search size={22} color="#22c55e" />
                        Análisis Crítico de Fuentes
                    </h3>
                    <p style={{ color: '#14532d', fontSize: '0.92rem', lineHeight: '1.65', margin: 0 }}>
                        Evaluación de la <strong>calidad de las fuentes</strong>: citación, lenguaje, actualidad
                        y experticia del autor. Se deben contrastar posturas, identificar coincidencias
                        y señalar vacíos en el conocimiento existente.
                    </p>
                </div>

            </div>

            {/* Structure & Common Errors */}
            <div className="responsive-flex-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>

                {/* Card: Estructura Recomendada */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #fef3c7, #fef9e7)',
                    border: '1px solid #fde68a',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#92400e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowRight size={24} color="#d97706" />
                        Estructura Recomendada
                    </h3>
                    <div style={{ color: '#78350f', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>1. Antecedentes teóricos:</strong> Estado del arte y trabajos previos relevantes
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>2. Bases teóricas:</strong> Teorías y modelos conceptuales que fundamentan el estudio
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>3. Variables/Categorías:</strong> Definición conceptual y operacional
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            <strong>4. Análisis crítico:</strong> Contribuciones, vacíos e inconsistencias teóricas
                        </p>
                        <p style={{ margin: 0 }}>
                            <strong>5. Síntesis:</strong> Articulación del marco con el diseño metodológico
                        </p>
                    </div>
                </div>

                {/* Card: Errores Comunes */}
                <div style={{
                    background: 'linear-gradient(to bottom right, #fef2f2, #fee2e2)',
                    border: '1px solid #fecaca',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#991b1b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={24} color="#ef4444" />
                        Errores Comunes a Evitar
                    </h3>
                    <div style={{ color: '#7f1d1d', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✗ <strong>Solo descripción:</strong> Enumerar fuentes sin análisis crítico
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✗ <strong>Fuentes no académicas:</strong> Usar Wikipedia, blogs o portales web genéricos
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✗ <strong>Exceso de citas textuales:</strong> Copiar fragmentos sin parafrasear ni analizar
                        </p>
                        <p style={{ marginBottom: '0.75rem' }}>
                            ✗ <strong>Fuentes desactualizadas:</strong> No incluir investigaciones recientes
                        </p>
                        <p style={{ margin: 0 }}>
                            ✗ <strong>Sin conexión:</strong> No vincular la teoría con los objetivos del estudio
                        </p>
                    </div>
                </div>

            </div>

            {/* APA 7 Citation Guide - Interactive Section */}
            <div style={{
                background: 'linear-gradient(to bottom right, #eef2ff, #e0e7ff)',
                border: '1px solid #c7d2fe',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2.5rem'
            }}>
                <h3 style={{ fontSize: '1.3rem', color: '#3730a3', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Quote size={24} color="#6366f1" />
                    Guía de Citación APA 7.ª Edición
                </h3>
                <p style={{ color: '#4338ca', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.55' }}>
                    Selecciona el tipo de citación para ver ejemplos prácticos. Recuerda: la <strong>paráfrasis</strong> es preferible porque demuestra lectura, análisis y redacción propia.
                </p>

                {/* Citation Type Tabs */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {citationTypes.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setActiveCitationType(type.id)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '2rem',
                                border: activeCitationType === type.id ? '2px solid #6366f1' : '1px solid #c7d2fe',
                                background: activeCitationType === type.id ? '#6366f1' : 'white',
                                color: activeCitationType === type.id ? 'white' : '#4338ca',
                                fontWeight: activeCitationType === type.id ? '600' : '500',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>

                {/* Active Citation Examples */}
                {activeType && (
                    <div style={{
                        background: 'white',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        border: '1px solid #c7d2fe'
                    }}>
                        <p style={{ color: '#4338ca', fontSize: '0.92rem', lineHeight: '1.65', marginBottom: '1.25rem' }}>
                            {activeType.description}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {activeType.examples.map((ex, i) => (
                                <div key={i} style={{
                                    padding: ex.isBlock ? '1.25rem 1.5rem' : '0.6rem 1rem',
                                    background: ex.isBlock ? '#f8fafc' : '#f1f5f9',
                                    borderRadius: '0.5rem',
                                    border: ex.isBlock ? '1px solid #cbd5e1' : 'none',
                                    borderLeft: ex.isBlock ? '4px solid #6366f1' : 'none'
                                }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        color: '#6366f1',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        display: 'block',
                                        marginBottom: '0.3rem'
                                    }}>
                                        {ex.label}
                                    </span>
                                    <code style={{
                                        fontSize: ex.isBlock ? '0.88rem' : '0.9rem',
                                        color: '#1e293b',
                                        fontFamily: 'inherit',
                                        lineHeight: ex.isBlock ? '1.7' : '1.4',
                                        fontStyle: ex.isBlock ? 'italic' : 'normal',
                                        whiteSpace: ex.isBlock ? 'pre-wrap' : 'normal'
                                    }}>
                                        {ex.example}
                                    </code>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Academic Sources Section */}
            <div style={{
                background: 'linear-gradient(to bottom right, #ecfeff, #cffafe)',
                border: '1px solid #a5f3fc',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2.5rem'
            }}>
                <h3 style={{ fontSize: '1.3rem', color: '#155e75', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Database size={24} color="#0891b2" />
                    Fuentes Académicas Recomendadas
                </h3>
                <p style={{ color: '#164e63', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.55' }}>
                    No limites tu búsqueda a una sola herramienta. Realiza búsquedas en diferentes plataformas académicas para obtener fuentes de calidad.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {academicSources.map((source, i) => (
                        <a
                            key={i}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                background: 'white',
                                borderRadius: '0.75rem',
                                padding: '1rem',
                                border: '1px solid #a5f3fc',
                                textDecoration: 'none',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                                cursor: 'pointer',
                                display: 'block'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                <div style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: source.color, flexShrink: 0
                                }} />
                                <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>{source.name}</span>
                                <ExternalLink size={14} color="#94a3b8" style={{ marginLeft: 'auto' }} />
                            </div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>{source.desc}</p>
                        </a>
                    ))}
                </div>

                {/* Warning: Non-Academic Sources */}
                <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'start'
                }}>
                    <Shield size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                    <div>
                        <strong style={{ color: '#991b1b', fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>
                            Fuentes NO válidas para investigación académica
                        </strong>
                        <p style={{ margin: 0, color: '#7f1d1d', fontSize: '0.85rem', lineHeight: '1.5' }}>
                            Evita referenciar: Wikipedia, blogs personales, Rincón del Vago, Monografías.com, Buenas Tareas
                            y demás portales web que no se consideran fuentes primarias ni académicas.
                        </p>
                    </div>
                </div>
            </div>

            {/* APA Tips Card */}
            <div style={{
                background: 'linear-gradient(to right, #f0fdf4, #dcfce7)',
                border: '1px solid #bbf7d0',
                borderRadius: '0.75rem',
                padding: '1.25rem 1.5rem',
                marginBottom: '2.5rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'start'
            }}>
                <HelpCircle size={22} color="#16a34a" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                <div style={{ fontSize: '0.9rem', color: '#14532d', lineHeight: '1.65' }}>
                    <strong style={{ display: 'block', marginBottom: '0.4rem' }}>Recomendaciones de estilo (normas APA 7)</strong>
                    Prefiera siempre la <strong>paráfrasis</strong> sobre la cita textual; demuestra análisis y redacción propia.
                    Use un solo método de gestión de citas (Mendeley, Zotero, EndNote o Microsoft Word); no los mezcle.
                    Utilice negritas y cursivas muy moderadamente; evite el subrayado.
                    Use abreviaturas solo cuando un término se repita continuamente y defínalas la primera vez.
                </div>
            </div>

            {/* Marco Subsections Tabs */}
            <div style={{
                background: 'white',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
                <h2 style={{ fontSize: '1.3rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                    Componentes del Marco Referencial
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.55' }}>
                    Selecciona cada componente para conocer su definición, elementos clave y recomendaciones de redacción.
                </p>

                {/* Tab Buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {marcoTabs.map(tab => {
                        const TabIcon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveMarcoTab(tab.id)}
                                style={{
                                    padding: '0.6rem 1.15rem',
                                    borderRadius: '0.5rem',
                                    border: activeMarcoTab === tab.id ? `2px solid ${tab.color}` : '1px solid #e2e8f0',
                                    background: activeMarcoTab === tab.id ? tab.bgGradient : 'white',
                                    color: activeMarcoTab === tab.id ? tab.color : '#64748b',
                                    fontWeight: activeMarcoTab === tab.id ? '600' : '500',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem'
                                }}
                            >
                                <TabIcon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Active Tab Content */}
                {activeMarcoData && (
                    <div style={{
                        background: activeMarcoData.bgGradient,
                        border: `1px solid ${activeMarcoData.border}`,
                        borderRadius: '0.75rem',
                        padding: '1.75rem',
                        transition: 'all 0.3s'
                    }}>
                        {/* Title */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                            {React.createElement(activeMarcoData.icon, { size: 26, color: activeMarcoData.color })}
                            <h3 style={{ fontSize: '1.2rem', color: activeMarcoData.color, margin: 0 }}>
                                {activeMarcoData.label}
                            </h3>
                        </div>

                        {/* Description */}
                        <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                            {activeMarcoData.description}
                        </p>

                        {/* Two-column: Elements + Tips */}
                        <div className="responsive-flex-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            {/* Elements */}
                            <div style={{
                                background: 'rgba(255,255,255,0.8)',
                                borderRadius: '0.625rem',
                                padding: '1.25rem',
                                border: `1px solid ${activeMarcoData.border}`
                            }}>
                                <h4 style={{ fontSize: '0.95rem', color: activeMarcoData.color, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Lightbulb size={18} /> Elementos que debe incluir
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#334155', lineHeight: '1.7' }}>
                                    {activeMarcoData.elements.map((el, i) => (
                                        <li key={i} style={{ marginBottom: '0.4rem' }}>{el}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Tips */}
                            <div style={{
                                background: 'rgba(255,255,255,0.8)',
                                borderRadius: '0.625rem',
                                padding: '1.25rem',
                                border: `1px solid ${activeMarcoData.border}`
                            }}>
                                <h4 style={{ fontSize: '0.95rem', color: activeMarcoData.color, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <HelpCircle size={18} /> Recomendaciones
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', lineHeight: '1.7' }}>
                                    {activeMarcoData.tips}
                                </p>
                            </div>
                        </div>

                        {/* Extra content for Antecedentes tab */}
                        {activeMarcoTab === 'antecedentes' && activeMarcoData.searchGuide && (
                            <div style={{ marginTop: '1.5rem' }}>
                                {/* Search Guide */}
                                <div style={{
                                    background: 'rgba(255,255,255,0.85)',
                                    borderRadius: '0.75rem',
                                    padding: '1.5rem',
                                    border: '1px solid #bae6fd',
                                    marginBottom: '1.25rem'
                                }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#0369a1', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Search size={20} /> {activeMarcoData.searchGuide.title}
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {activeMarcoData.searchGuide.steps.map((s, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                                                <div style={{ background: '#0369a1', color: 'white', borderRadius: '0.375rem', padding: '0.2rem 0.55rem', fontSize: '0.75rem', fontWeight: '700', flexShrink: 0, marginTop: '0.15rem' }}>{i + 1}</div>
                                                <div>
                                                    <strong style={{ color: '#0c4a6e', fontSize: '0.9rem' }}>{s.step.replace(/^\d+\.\s*/, '')}</strong>
                                                    <p style={{ margin: '0.2rem 0 0', color: '#334155', fontSize: '0.85rem', lineHeight: '1.55' }}>{s.detail}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #bae6fd', marginBottom: '1.25rem' }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#0369a1', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Database size={20} /> Bases de datos recomendadas para buscar antecedentes
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                                        {activeMarcoData.searchGuide.databases.map((db, i) => (
                                            <a key={i} href={db.url} target="_blank" rel="noopener noreferrer"
                                                style={{ background: 'white', borderRadius: '0.5rem', padding: '0.85rem', border: '1px solid #bae6fd', textDecoration: 'none', transition: 'transform 0.15s, box-shadow 0.15s', display: 'block' }}
                                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                                                    <span style={{ fontWeight: '600', color: '#0369a1', fontSize: '0.9rem' }}>{db.name}</span>
                                                    <ExternalLink size={13} color="#94a3b8" style={{ marginLeft: 'auto' }} />
                                                </div>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: '1.4' }}>{db.tip}</p>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                                {/* Bibliometrix Guide */}
                                <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #bae6fd', marginBottom: '1.25rem' }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#0369a1', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.1rem' }}>📊</span> Guía de Instalación de Bibliometrix
                                    </h4>
                                    <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.55' }}>Bibliometrix es una herramienta de análisis bibliométrico que te permite mapear la producción científica sobre tu tema de investigación, identificar autores clave, tendencias y vacíos en la literatura.</p>
                                    <div style={{ background: '#f0f9ff', borderRadius: '0.5rem', padding: '1.25rem', border: '1px solid #bae6fd', marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                                            <div style={{ background: '#0369a1', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', flexShrink: 0 }}>1</div>
                                            <strong style={{ color: '#0c4a6e', fontSize: '0.95rem' }}>Instalar R</strong>
                                        </div>
                                        <p style={{ margin: '0 0 0.6rem 0', color: '#334155', fontSize: '0.85rem', lineHeight: '1.5' }}>Descarga e instala R desde el sitio oficial de CRAN:</p>
                                        <a href="https://cloud.r-project.org/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#0369a1', fontSize: '0.9rem', fontWeight: '600', textDecoration: 'none', padding: '0.4rem 0.75rem', background: 'white', borderRadius: '0.375rem', border: '1px solid #7dd3fc' }}>
                                            <ExternalLink size={14} /> https://cloud.r-project.org/
                                        </a>
                                    </div>
                                    <div style={{ background: '#f0f9ff', borderRadius: '0.5rem', padding: '1.25rem', border: '1px solid #bae6fd', marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                                            <div style={{ background: '#0369a1', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', flexShrink: 0 }}>2</div>
                                            <strong style={{ color: '#0c4a6e', fontSize: '0.95rem' }}>Instalar RStudio</strong>
                                        </div>
                                        <p style={{ margin: '0 0 0.6rem 0', color: '#334155', fontSize: '0.85rem', lineHeight: '1.5' }}>Descarga la versión más reciente de RStudio Desktop:</p>
                                        <a href="https://posit.co/download/rstudio-desktop/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#0369a1', fontSize: '0.9rem', fontWeight: '600', textDecoration: 'none', padding: '0.4rem 0.75rem', background: 'white', borderRadius: '0.375rem', border: '1px solid #7dd3fc' }}>
                                            <ExternalLink size={14} /> https://posit.co/download/rstudio-desktop/
                                        </a>
                                    </div>
                                    <div style={{ background: '#f0f9ff', borderRadius: '0.5rem', padding: '1.25rem', border: '1px solid #bae6fd', marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                                            <div style={{ background: '#0369a1', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', flexShrink: 0 }}>3</div>
                                            <strong style={{ color: '#0c4a6e', fontSize: '0.95rem' }}>Instalar Bibliometrix</strong>
                                        </div>
                                        <p style={{ margin: '0 0 0.5rem 0', color: '#334155', fontSize: '0.85rem', fontWeight: '600' }}>Opción A — Desde la consola de R:</p>
                                        <div style={{ background: '#1e293b', borderRadius: '0.375rem', padding: '0.85rem', marginBottom: '0.85rem', fontFamily: "'Fira Code', 'Consolas', monospace", fontSize: '0.82rem', lineHeight: '1.7', color: '#e2e8f0', overflowX: 'auto' }}>
                                            <div><span style={{ color: '#94a3b8' }}>{'# Instalar pak si no está instalado'}</span></div>
                                            <div><span style={{ color: '#7dd3fc' }}>if</span> (!<span style={{ color: '#fbbf24' }}>require</span>(<span style={{ color: '#a5f3fc' }}>"pak"</span>, <span style={{ color: '#fbbf24' }}>quietly</span>=<span style={{ color: '#7dd3fc' }}>TRUE</span>)) <span style={{ color: '#fbbf24' }}>install.packages</span>(<span style={{ color: '#a5f3fc' }}>"pak"</span>)</div>
                                            <div style={{ marginTop: '0.3rem' }}><span style={{ color: '#94a3b8' }}>{'# Instalar bibliometrix'}</span></div>
                                            <div><span style={{ color: '#fbbf24' }}>pak::pkg_install</span>(<span style={{ color: '#a5f3fc' }}>"bibliometrix"</span>)</div>
                                        </div>
                                        <p style={{ margin: '0 0 0.5rem 0', color: '#334155', fontSize: '0.85rem', fontWeight: '600' }}>Opción B — Desde RStudio (interfaz gráfica):</p>
                                        <ol style={{ margin: '0 0 0.85rem 0', paddingLeft: '1.25rem', color: '#334155', fontSize: '0.85rem', lineHeight: '1.7' }}>
                                            <li>Abra RStudio y vaya al menú: <strong>Tools → Install Packages...</strong></li>
                                            <li>Escriba <strong>"bibliometrix"</strong> en el campo de búsqueda</li>
                                            <li>Marque la casilla <strong>"Install dependencies"</strong></li>
                                            <li>Haga clic en <strong>"Install"</strong></li>
                                        </ol>
                                    </div>
                                    <div style={{ background: 'linear-gradient(to right, #ecfdf5, #d1fae5)', borderRadius: '0.5rem', padding: '1.25rem', border: '1px solid #6ee7b7' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                                            <div style={{ background: '#059669', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', flexShrink: 0 }}>✓</div>
                                            <strong style={{ color: '#065f46', fontSize: '0.95rem' }}>Iniciar Biblioshiny</strong>
                                        </div>
                                        <p style={{ margin: '0 0 0.5rem 0', color: '#065f46', fontSize: '0.85rem', lineHeight: '1.5' }}>Una vez instalado, abra RStudio y ejecute el siguiente comando para iniciar la interfaz web de análisis bibliométrico:</p>
                                        <div style={{ background: '#1e293b', borderRadius: '0.375rem', padding: '0.75rem', fontFamily: "'Fira Code', 'Consolas', monospace", fontSize: '0.85rem', color: '#a5f3fc' }}>
                                            <span style={{ color: '#fbbf24' }}>bibliometrix::biblioshiny</span><span style={{ color: '#e2e8f0' }}>()</span>
                                        </div>
                                    </div>
                                </div>
                                {/* AI Generator for Antecedentes */}
                                <div style={{ background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #7dd3fc' }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#0369a1', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>✨</span> Generador de Guía de Antecedentes con IA
                                    </h4>
                                    <p style={{ color: '#334155', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.5' }}>Ingresa tu título y la IA generará: palabras clave de búsqueda, cadenas de búsqueda para bases de datos, estructura de redacción y un ejemplo redactado.</p>
                                    <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                                        <label style={{ fontSize: '0.85rem' }}>Título de tu Investigación</label>
                                        <input type="text" className="input-field" placeholder="Ej: Impacto del aprendizaje colaborativo en el rendimiento académico..." value={antecedentesTitle} onChange={(e) => setAntecedentesTitle(e.target.value)} style={{ padding: '0.65rem' }} />
                                    </div>
                                    <button onClick={handleGenerateAntecedentes} disabled={isGeneratingAntecedentes || !antecedentesTitle.trim()}
                                        style={{ width: '100%', padding: '0.75rem', background: isGeneratingAntecedentes || !antecedentesTitle.trim() ? '#94a3b8' : 'linear-gradient(to right, #0369a1, #0c4a6e)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: isGeneratingAntecedentes || !antecedentesTitle.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.95rem', transition: 'all 0.2s' }}>
                                        {isGeneratingAntecedentes ? (<><span style={{ animation: 'spin 1s linear infinite' }}>⌛</span> Generando...</>) : (<><span style={{ fontSize: '1.1rem' }}>🔍</span> Generar Guía de Búsqueda y Redacción</>)}
                                    </button>
                                    {antecedentesResult && (
                                        <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'white', border: '2px solid #7dd3fc', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)' }}>
                                            <h5 style={{ margin: '0 0 0.75rem 0', color: '#0369a1', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ fontSize: '1.2rem' }}>📋</span> Guía Generada</h5>
                                            <div style={{ color: '#1e293b', fontSize: '0.92rem', lineHeight: '1.75', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{antecedentesResult}</div>
                                        </div>
                                    )}
                                    {antecedentesError && (
                                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem' }}>
                                            <p style={{ margin: 0, color: '#991b1b', fontSize: '0.85rem' }}>⚠️ {antecedentesError}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Writing Example for Antecedentes */}
                                <div style={{
                                    background: 'rgba(255,255,255,0.9)',
                                    borderRadius: '0.75rem',
                                    padding: '1.5rem',
                                    border: '1px solid #bae6fd',
                                    marginTop: '1.25rem'
                                }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#0369a1', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FileText size={20} /> Ejemplo de Redacción de un Antecedente
                                    </h4>
                                    <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                                        A continuación se presenta un ejemplo de cómo redactar un antecedente de investigación. Observe cómo se menciona al autor, el objetivo, la metodología, los resultados y la relación con su investigación.
                                    </p>

                                    {/* Example paragraph */}
                                    <div style={{
                                        background: '#f0f9ff',
                                        borderLeft: '4px solid #0369a1',
                                        borderRadius: '0 0.5rem 0.5rem 0',
                                        padding: '1.25rem 1.5rem',
                                        marginBottom: '1rem',
                                        fontSize: '0.92rem',
                                        color: '#1e293b',
                                        lineHeight: '1.85',
                                        fontStyle: 'italic'
                                    }}>
                                        <p style={{ margin: '0 0 1rem 0' }}>
                                            <span style={{ background: '#e0f2fe', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#0369a1', verticalAlign: 'super' }}>AUTOR Y AÑO</span>{' '}
                                            González y Martínez (2021)
                                            {' '}<span style={{ background: '#e0f2fe', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#0369a1', verticalAlign: 'super' }}>OBJETIVO</span>{' '}
                                            desarrollaron una investigación con el propósito de analizar el impacto de las estrategias de aprendizaje colaborativo en el rendimiento académico de estudiantes universitarios de la Facultad de Ingeniería de la Universidad Nacional de Colombia.
                                            {' '}<span style={{ background: '#e0f2fe', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#0369a1', verticalAlign: 'super' }}>METODOLOGÍA</span>{' '}
                                            Para ello, emplearon un enfoque cuantitativo con diseño cuasiexperimental, trabajando con una muestra de 120 estudiantes divididos en grupo control y grupo experimental durante un semestre académico.
                                        </p>
                                        <p style={{ margin: '0' }}>
                                            <span style={{ background: '#e0f2fe', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#0369a1', verticalAlign: 'super' }}>RESULTADOS</span>{' '}
                                            Los resultados evidenciaron que el grupo experimental obtuvo un incremento significativo del 23% en su rendimiento académico en comparación con el grupo control, siendo la variable de trabajo en equipo la de mayor incidencia (p &lt; 0.05).
                                            {' '}<span style={{ background: '#e0f2fe', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#0369a1', verticalAlign: 'super' }}>CONCLUSIONES</span>{' '}
                                            Los autores concluyeron que las estrategias colaborativas bien estructuradas favorecen el aprendizaje significativo.
                                            {' '}<span style={{ background: '#e0f2fe', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#0369a1', verticalAlign: 'super' }}>RELACIÓN</span>{' '}
                                            Este estudio aporta a la presente investigación al confirmar la relación positiva entre colaboración y rendimiento, sirviendo como referente metodológico para el diseño del instrumento de recolección de datos.
                                        </p>
                                    </div>

                                    {/* Structure labels */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                                        {[
                                            { label: 'Autor(es) y año', desc: 'Inicie con la referencia al autor y año de publicación.' },
                                            { label: 'Objetivo del estudio', desc: 'Indique qué buscaba investigar o demostrar.' },
                                            { label: 'Metodología', desc: 'Describa el enfoque, diseño y muestra del estudio.' },
                                            { label: 'Resultados principales', desc: 'Presente los hallazgos más relevantes con datos.' },
                                            { label: 'Conclusiones', desc: 'Resuma las conclusiones del autor sobre el tema.' },
                                            { label: 'Relación con su investigación', desc: 'Explique cómo aporta este antecedente a su estudio.' },
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'start' }}>
                                                <div style={{ background: '#0369a1', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '700', flexShrink: 0, marginTop: '0.1rem' }}>✓</div>
                                                <div>
                                                    <strong style={{ color: '#0c4a6e', fontSize: '0.82rem' }}>{item.label}</strong>
                                                    <p style={{ margin: 0, color: '#475569', fontSize: '0.78rem', lineHeight: '1.4' }}>{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Extra content for Marco Teórico tab */}
                        {activeMarcoTab === 'teorico' && activeMarcoData.searchGuide && (
                            <div style={{ marginTop: '1.5rem' }}>
                                {/* Search Guide */}
                                <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #ddd6fe', marginBottom: '1.25rem' }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#7c3aed', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Search size={20} /> {activeMarcoData.searchGuide.title}
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {activeMarcoData.searchGuide.steps.map((s, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                                                <div style={{ background: '#7c3aed', color: 'white', borderRadius: '0.375rem', padding: '0.2rem 0.55rem', fontSize: '0.75rem', fontWeight: '700', flexShrink: 0, marginTop: '0.15rem' }}>{i + 1}</div>
                                                <div>
                                                    <strong style={{ color: '#5b21b6', fontSize: '0.9rem' }}>{s.step.replace(/^\d+\.\s*/, '')}</strong>
                                                    <p style={{ margin: '0.2rem 0 0', color: '#334155', fontSize: '0.85rem', lineHeight: '1.55' }}>{s.detail}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Databases */}
                                <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #ddd6fe', marginBottom: '1.25rem' }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#7c3aed', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Database size={20} /> Bases de datos recomendadas para buscar teorías
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                                        {activeMarcoData.searchGuide.databases.map((db, i) => (
                                            <a key={i} href={db.url} target="_blank" rel="noopener noreferrer"
                                                style={{ background: 'white', borderRadius: '0.5rem', padding: '0.85rem', border: '1px solid #ddd6fe', textDecoration: 'none', transition: 'transform 0.15s, box-shadow 0.15s', display: 'block' }}
                                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                                                    <span style={{ fontWeight: '600', color: '#7c3aed', fontSize: '0.9rem' }}>{db.name}</span>
                                                    <ExternalLink size={13} color="#94a3b8" style={{ marginLeft: 'auto' }} />
                                                </div>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: '1.4' }}>{db.tip}</p>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                                {/* AI Generator for Marco Teórico */}
                                <div style={{ background: 'linear-gradient(to right, #f5f3ff, #ede9fe)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #c4b5fd' }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#7c3aed', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>✨</span> Generador de Guía del Marco Teórico con IA
                                    </h4>
                                    <p style={{ color: '#334155', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.5' }}>Ingresa tu título y la IA generará: teorías sugeridas, palabras clave, cadenas de búsqueda, estructura de redacción, ejemplo redactado y autores representativos.</p>
                                    <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                                        <label style={{ fontSize: '0.85rem' }}>Título de tu Investigación</label>
                                        <input type="text" className="input-field" placeholder="Ej: Influencia del liderazgo transformacional en la motivación laboral..." value={teoricoTitle} onChange={(e) => setTeoricoTitle(e.target.value)} style={{ padding: '0.65rem' }} />
                                    </div>
                                    <button onClick={handleGenerateTeorico} disabled={isGeneratingTeorico || !teoricoTitle.trim()}
                                        style={{ width: '100%', padding: '0.75rem', background: isGeneratingTeorico || !teoricoTitle.trim() ? '#94a3b8' : 'linear-gradient(to right, #7c3aed, #5b21b6)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: isGeneratingTeorico || !teoricoTitle.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.95rem', transition: 'all 0.2s' }}>
                                        {isGeneratingTeorico ? (<><span style={{ animation: 'spin 1s linear infinite' }}>⌛</span> Generando...</>) : (<><span style={{ fontSize: '1.1rem' }}>📚</span> Generar Guía de Teorías y Redacción</>)}
                                    </button>
                                    {teoricoResult && (
                                        <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'white', border: '2px solid #c4b5fd', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)' }}>
                                            <h5 style={{ margin: '0 0 0.75rem 0', color: '#7c3aed', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ fontSize: '1.2rem' }}>📋</span> Guía Generada</h5>
                                            <div style={{ color: '#1e293b', fontSize: '0.92rem', lineHeight: '1.75', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{teoricoResult}</div>
                                        </div>
                                    )}
                                    {teoricoError && (
                                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem' }}>
                                            <p style={{ margin: 0, color: '#991b1b', fontSize: '0.85rem' }}>⚠️ {teoricoError}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Writing Example */}
                                <div style={{
                                    background: 'rgba(255,255,255,0.9)',
                                    borderRadius: '0.75rem',
                                    padding: '1.5rem',
                                    border: '1px solid #ddd6fe',
                                    marginTop: '1.25rem'
                                }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#7c3aed', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FileText size={20} /> Ejemplo de Redacción del Marco Teórico
                                    </h4>
                                    <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                                        A continuación se presenta un ejemplo de cómo redactar un fragmento del marco teórico, utilizando paráfrasis con citas APA 7.ª edición. Observe cómo se introduce la teoría, se cita al autor, se explica el concepto y se vincula con la investigación.
                                    </p>

                                    {/* Example paragraph */}
                                    <div style={{
                                        background: '#faf5ff',
                                        borderLeft: '4px solid #7c3aed',
                                        borderRadius: '0 0.5rem 0.5rem 0',
                                        padding: '1.25rem 1.5rem',
                                        marginBottom: '1rem',
                                        fontSize: '0.92rem',
                                        color: '#1e293b',
                                        lineHeight: '1.85',
                                        fontStyle: 'italic'
                                    }}>
                                        <p style={{ margin: '0 0 1rem 0' }}>
                                            <span style={{ background: '#ede9fe', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#7c3aed', verticalAlign: 'super' }}>INTRODUCCIÓN DE TEORÍA</span>{' '}
                                            Desde la perspectiva del constructivismo social, el aprendizaje se concibe como un proceso activo en el que el individuo construye conocimiento a partir de la interacción con su entorno social.
                                            {' '}<span style={{ background: '#ede9fe', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#7c3aed', verticalAlign: 'super' }}>CITA AL AUTOR</span>{' '}
                                            Según Vygotsky (1978), la zona de desarrollo próximo constituye el espacio entre lo que el aprendiz puede hacer de manera independiente y lo que puede lograr con la guía de un par más experimentado.
                                            {' '}<span style={{ background: '#ede9fe', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#7c3aed', verticalAlign: 'super' }}>EXPLICACIÓN</span>{' '}
                                            Este concepto resulta fundamental para comprender cómo las estrategias de aprendizaje colaborativo pueden potenciar el rendimiento académico, ya que la mediación entre pares facilita la internalización de conocimientos complejos (Daniels, 2017).
                                        </p>
                                        <p style={{ margin: '0' }}>
                                            <span style={{ background: '#ede9fe', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#7c3aed', verticalAlign: 'super' }}>ANÁLISIS CRÍTICO</span>{' '}
                                            No obstante, autores como Kirschner et al. (2018) señalan que el aprendizaje colaborativo no siempre conduce a resultados positivos, especialmente cuando no se establecen roles claros dentro del grupo de trabajo, lo que puede generar el efecto de "polizón" donde algunos miembros no participan activamente.
                                            {' '}<span style={{ background: '#ede9fe', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#7c3aed', verticalAlign: 'super' }}>VINCULACIÓN</span>{' '}
                                            Esta perspectiva es relevante para la presente investigación, pues permite identificar las condiciones necesarias para que la implementación de estrategias colaborativas sea efectiva en el contexto universitario.
                                        </p>
                                    </div>

                                    {/* Structure labels */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                                        {[
                                            { label: 'Introducción de teoría', desc: 'Presente la corriente teórica y su enfoque general.' },
                                            { label: 'Cita al autor', desc: 'Mencione al autor principal con paráfrasis (Autor, año).' },
                                            { label: 'Explicación', desc: 'Desarrolle el concepto y su relevancia para el estudio.' },
                                            { label: 'Análisis crítico', desc: 'Contraste con otros autores; identifique limitaciones.' },
                                            { label: 'Vinculación', desc: 'Conecte la teoría con sus objetivos de investigación.' },
                                            { label: 'Citas múltiples', desc: 'Use varias fuentes por párrafo para mayor solidez.' },
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'start' }}>
                                                <div style={{ background: '#7c3aed', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '700', flexShrink: 0, marginTop: '0.1rem' }}>✓</div>
                                                <div>
                                                    <strong style={{ color: '#5b21b6', fontSize: '0.82rem' }}>{item.label}</strong>
                                                    <p style={{ margin: 0, color: '#475569', fontSize: '0.78rem', lineHeight: '1.4' }}>{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Theory Suggestion Card */}
                                <div style={{ background: 'linear-gradient(to right, #faf5ff, #f3e8ff)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #d8b4fe', marginTop: '1.5rem' }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#6b21a8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>💡</span> Explorador Rápido de Teorías
                                    </h4>
                                    <p style={{ color: '#4c1d95', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.5' }}>¿No sabes qué teorías sustentan tu proyecto? Ingresa tu título y la IA te sugerirá los modelos y autores más relevantes para tu marco teórico.</p>
                                    <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#5b21b6' }}>Título de tu Investigación</label>
                                        <input type="text" className="input-field" placeholder="Ej: Influencia de la gamificación en la motivación escolar..." value={suggestedTheoriesTitle} onChange={(e) => setSuggestedTheoriesTitle(e.target.value)} style={{ padding: '0.65rem', borderColor: '#d8b4fe' }} />
                                    </div>
                                    <button onClick={handleSuggestTheories} disabled={isGeneratingTheories || !suggestedTheoriesTitle.trim()}
                                        style={{ width: '100%', padding: '0.75rem', background: isGeneratingTheories || !suggestedTheoriesTitle.trim() ? '#c4b5fd' : 'linear-gradient(to right, #7e22ce, #6b21a8)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: isGeneratingTheories || !suggestedTheoriesTitle.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.95rem', transition: 'all 0.2s' }}>
                                        {isGeneratingTheories ? (<><span style={{ animation: 'spin 1s linear infinite' }}>⌛</span> Buscando teorías...</>) : (<><span style={{ fontSize: '1.1rem' }}>🧠</span> Sugerir Teorías</>)}
                                    </button>
                                    {suggestedTheoriesResult && (
                                        <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'white', border: '2px solid #d8b4fe', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)' }}>
                                            <h5 style={{ margin: '0 0 0.75rem 0', color: '#7e22ce', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ fontSize: '1.2rem' }}>📌</span> Teorías Sugeridas</h5>
                                            <div style={{ color: '#1e293b', fontSize: '0.92rem', lineHeight: '1.75', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{suggestedTheoriesResult}</div>
                                        </div>
                                    )}
                                    {theoriesError && (
                                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem' }}>
                                            <p style={{ margin: '0', color: '#991b1b', fontSize: '0.85rem' }}>⚠️ {theoriesError}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Extra content for Marco Conceptual tab */}
                        {activeMarcoTab === 'conceptual' && activeMarcoData.searchGuide && (
                            <div style={{ marginTop: '1.5rem' }}>
                                {/* Comparison Card: Teórico vs Conceptual */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                                    <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '0.75rem', padding: '1.25rem' }}>
                                        <h4 style={{ fontSize: '1rem', color: '#7c3aed', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <BookOpen size={18} /> Marco Teórico
                                        </h4>
                                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.88rem', color: '#5b21b6', lineHeight: '1.6' }}>
                                            <li style={{ marginBottom: '0.3rem' }}><strong>Enfoque:</strong> Paradigmas y modelos amplios.</li>
                                            <li style={{ marginBottom: '0.3rem' }}><strong>Propósito:</strong> Explicar el fundamento y <em>por qué</em> ocurre el fenómeno.</li>
                                            <li><strong>Ejemplo:</strong> Teoría del Aprendizaje Social (Bandura, 1977).</li>
                                        </ul>
                                    </div>
                                    <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '0.75rem', padding: '1.25rem' }}>
                                        <h4 style={{ fontSize: '1rem', color: '#059669', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Layers size={18} /> Marco Conceptual
                                        </h4>
                                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.88rem', color: '#065f46', lineHeight: '1.6' }}>
                                            <li style={{ marginBottom: '0.3rem' }}><strong>Enfoque:</strong> Variables, categorías y dimensiones.</li>
                                            <li style={{ marginBottom: '0.3rem' }}><strong>Propósito:</strong> Aterrizar, definir <em>qué es</em> y delimitar <em>cómo se medirá</em>.</li>
                                            <li><strong>Ejemplo:</strong> Autoeficacia: concepto y sus 3 dimensiones de medición.</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Search Guide */}
                                <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #6ee7b7', marginBottom: '1.25rem' }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#059669', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Search size={20} /> {activeMarcoData.searchGuide.title}
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {activeMarcoData.searchGuide.steps.map((s, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                                                <div style={{ background: '#059669', color: 'white', borderRadius: '0.375rem', padding: '0.2rem 0.55rem', fontSize: '0.75rem', fontWeight: '700', flexShrink: 0, marginTop: '0.15rem' }}>{i + 1}</div>
                                                <div>
                                                    <strong style={{ color: '#047857', fontSize: '0.9rem' }}>{s.step.replace(/^\d+\.\s*/, '')}</strong>
                                                    <p style={{ margin: '0.2rem 0 0', color: '#334155', fontSize: '0.85rem', lineHeight: '1.55' }}>{s.detail}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Databases */}
                                <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #6ee7b7', marginBottom: '1.25rem' }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#059669', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Database size={20} /> Bases de datos recomendadas para conceptos
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                                        {activeMarcoData.searchGuide.databases.map((db, i) => (
                                            <a key={i} href={db.url} target="_blank" rel="noopener noreferrer"
                                                style={{ background: 'white', borderRadius: '0.5rem', padding: '0.85rem', border: '1px solid #6ee7b7', textDecoration: 'none', transition: 'transform 0.15s, box-shadow 0.15s', display: 'block' }}
                                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                                                    <span style={{ fontWeight: '600', color: '#059669', fontSize: '0.9rem' }}>{db.name}</span>
                                                    <ExternalLink size={13} color="#94a3b8" style={{ marginLeft: 'auto' }} />
                                                </div>
                                                <p style={{ margin: '0', fontSize: '0.8rem', color: '#475569', lineHeight: '1.4' }}>{db.tip}</p>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                                {/* AI Generator for Marco Conceptual */}
                                <div style={{ background: 'linear-gradient(to right, #ecfdf5, #d1fae5)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #34d399' }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#059669', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>✨</span> Generador de Guía del Marco Conceptual con IA
                                    </h4>
                                    <p style={{ color: '#334155', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.5' }}>Ingresa tu título y la IA generará: conceptos clave a definir, dimensiones, esquema sugerido, y ejemplo de operacionalización de variables.</p>
                                    <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                                        <label style={{ fontSize: '0.85rem' }}>Título de tu Investigación</label>
                                        <input type="text" className="input-field" placeholder="Ej: Influencia del clima organizacional en la productividad..." value={conceptualTitle} onChange={(e) => setConceptualTitle(e.target.value)} style={{ padding: '0.65rem' }} />
                                    </div>
                                    <button onClick={handleGenerateConceptual} disabled={isGeneratingConceptual || !conceptualTitle.trim()}
                                        style={{ width: '100%', padding: '0.75rem', background: isGeneratingConceptual || !conceptualTitle.trim() ? '#94a3b8' : 'linear-gradient(to right, #059669, #047857)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: isGeneratingConceptual || !conceptualTitle.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.95rem', transition: 'all 0.2s' }}>
                                        {isGeneratingConceptual ? (<><span style={{ animation: 'spin 1s linear infinite' }}>⌛</span> Generando...</>) : (<><span style={{ fontSize: '1.1rem' }}>🧩</span> Generar Guía de Conceptos</>)}
                                    </button>
                                    {conceptualResult && (
                                        <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'white', border: '2px solid #34d399', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)' }}>
                                            <h5 style={{ margin: '0 0 0.75rem 0', color: '#059669', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ fontSize: '1.2rem' }}>📋</span> Guía Generada</h5>
                                            <div style={{ color: '#1e293b', fontSize: '0.92rem', lineHeight: '1.75', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{conceptualResult}</div>
                                        </div>
                                    )}
                                    {conceptualError && (
                                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem' }}>
                                            <p style={{ margin: '0', color: '#991b1b', fontSize: '0.85rem' }}>⚠️ {conceptualError}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Writing Example */}
                                <div style={{
                                    background: 'rgba(255,255,255,0.9)',
                                    borderRadius: '0.75rem',
                                    padding: '1.5rem',
                                    border: '1px solid #6ee7b7',
                                    marginTop: '1.25rem'
                                }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#059669', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FileText size={20} /> Ejemplo de Definición Conceptual
                                    </h4>
                                    <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                                        A continuación se presenta un ejemplo de cómo redactar la definición conceptual y operacional de una variable. Observe la estructura clara y fundamentada.
                                    </p>

                                    {/* Example paragraph */}
                                    <div style={{
                                        background: '#f0fdf4',
                                        borderLeft: '4px solid #059669',
                                        borderRadius: '0 0.5rem 0.5rem 0',
                                        padding: '1.25rem 1.5rem',
                                        marginBottom: '1rem',
                                        fontSize: '0.92rem',
                                        color: '#1e293b',
                                        lineHeight: '1.85',
                                        fontStyle: 'italic'
                                    }}>
                                        <p style={{ margin: '0 0 1rem 0' }}>
                                            <span style={{ background: '#d1fae5', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#059669', verticalAlign: 'super' }}>CONCEPTO CLAVE</span>{' '}
                                            <strong>Clima Organizacional.</strong>
                                            {' '}<span style={{ background: '#d1fae5', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#059669', verticalAlign: 'super' }}>DEFINICIÓN TEÓRICA</span>{' '}
                                            El clima organizacional se define como las percepciones compartidas por los empleados respecto a las políticas, prácticas y procedimientos que se recompensan, apoyan y esperan en el entorno laboral (Schneider et al., 2013).
                                            {' '}<span style={{ background: '#d1fae5', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#059669', verticalAlign: 'super' }}>CONTRASTE</span>{' '}
                                            A diferencia de la cultura organizacional, que representa los valores profundos de la empresa, el clima es un fenómeno "más superficial" y directamente vinculado a la experiencia cotidiana del trabajador (Ostroff et al., 2012).
                                        </p>
                                        <p style={{ margin: '0' }}>
                                            <span style={{ background: '#d1fae5', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#059669', verticalAlign: 'super' }}>DEFINICIÓN OPERACIONAL</span>{' '}
                                            Para efectos de esta investigación, el clima organizacional será operacionalizado y medido a través del instrumento ECO (Escala de Clima Organizacional) adaptado por Silva (2019), el cual evalúa tres dimensiones fundamentales: (a) liderazgo y apoyo directivo, (b) cohesión de equipo, y (c) condiciones físicas del entorno.
                                        </p>
                                    </div>

                                    {/* Structure labels */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                                        {[
                                            { label: 'Concepto clave', desc: 'Identifique claramente el concepto o variable.' },
                                            { label: 'Definición teórica', desc: 'Aporte la definición de un autor representativo.' },
                                            { label: 'Contraste (opcional)', desc: 'Diferéncielo de conceptos similares para evitar confusión.' },
                                            { label: 'Definición operacional', desc: 'Explique cómo se medirá o aplicará en su estudio.' },
                                            { label: 'Dimensiones', desc: 'Desglose el concepto en sus partes medibles.' },
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'start' }}>
                                                <div style={{ background: '#059669', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '700', flexShrink: 0, marginTop: '0.1rem' }}>✓</div>
                                                <div>
                                                    <strong style={{ color: '#047857', fontSize: '0.82rem' }}>{item.label}</strong>
                                                    <p style={{ margin: '0', color: '#475569', fontSize: '0.78rem', lineHeight: '1.4' }}>{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Concepts Suggestion Card */}
                                <div style={{ background: 'linear-gradient(to right, #ecfdf5, #d1fae5)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #6ee7b7', marginTop: '1.5rem' }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#065f46', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>💡</span> Explorador Rápido de Conceptos
                                    </h4>
                                    <p style={{ color: '#064e3b', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.5' }}>¿No estás seguro de cuáles términos definen tu investigación? Ingresa tu título y la IA te sugerirá las variables y conceptos clave esenciales para tu marco conceptual.</p>
                                    <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#065f46' }}>Título de tu Investigación</label>
                                        <input type="text" className="input-field" placeholder="Ej: Brecha digital en escuelas rurales del municipio X..." value={suggestedConceptsTitle} onChange={(e) => setSuggestedConceptsTitle(e.target.value)} style={{ padding: '0.65rem', borderColor: '#6ee7b7' }} />
                                    </div>
                                    <button onClick={handleSuggestConcepts} disabled={isGeneratingConcepts || !suggestedConceptsTitle.trim()}
                                        style={{ width: '100%', padding: '0.75rem', background: isGeneratingConcepts || !suggestedConceptsTitle.trim() ? '#a7f3d0' : 'linear-gradient(to right, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: isGeneratingConcepts || !suggestedConceptsTitle.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.95rem', transition: 'all 0.2s' }}>
                                        {isGeneratingConcepts ? (<><span style={{ animation: 'spin 1s linear infinite' }}>⌛</span> Buscando conceptos...</>) : (<><span style={{ fontSize: '1.1rem' }}>🧠</span> Sugerir Conceptos</>)}
                                    </button>
                                    {suggestedConceptsResult && (
                                        <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'white', border: '2px solid #6ee7b7', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)' }}>
                                            <h5 style={{ margin: '0 0 0.75rem 0', color: '#059669', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ fontSize: '1.2rem' }}>📌</span> Conceptos Sugeridos</h5>
                                            <div style={{ color: '#1e293b', fontSize: '0.92rem', lineHeight: '1.75', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{suggestedConceptsResult}</div>
                                        </div>
                                    )}
                                    {conceptsError && (
                                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem' }}>
                                            <p style={{ margin: '0', color: '#991b1b', fontSize: '0.85rem' }}>⚠️ {conceptsError}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Extra content for Marco Contextual tab */}
                        {activeMarcoTab === 'contextual' && activeMarcoData.searchGuide && (
                            <div style={{ marginTop: '1.5rem' }}>
                                {/* Search Guide */}
                                <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #fde68a', marginBottom: '1.25rem' }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#d97706', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Search size={20} /> {activeMarcoData.searchGuide.title}
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {activeMarcoData.searchGuide.steps.map((s, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                                                <div style={{ background: '#d97706', color: 'white', borderRadius: '0.375rem', padding: '0.2rem 0.55rem', fontSize: '0.75rem', fontWeight: '700', flexShrink: 0, marginTop: '0.15rem' }}>{i + 1}</div>
                                                <div>
                                                    <strong style={{ color: '#b45309', fontSize: '0.9rem' }}>{s.step.replace(/^\d+\.\s*/, '')}</strong>
                                                    <p style={{ margin: '0.2rem 0 0', color: '#334155', fontSize: '0.85rem', lineHeight: '1.55' }}>{s.detail}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Databases */}
                                <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #fde68a', marginBottom: '1.25rem' }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#d97706', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Database size={20} /> Bases de datos y fuentes recomendadas
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                                        {activeMarcoData.searchGuide.databases.map((db, i) => (
                                            <a key={i} href={db.url} target="_blank" rel="noopener noreferrer"
                                                style={{ background: 'white', borderRadius: '0.5rem', padding: '0.85rem', border: '1px solid #fde68a', textDecoration: 'none', transition: 'transform 0.15s, box-shadow 0.15s', display: 'block' }}
                                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                                                    <span style={{ fontWeight: '600', color: '#d97706', fontSize: '0.9rem' }}>{db.name}</span>
                                                    <ExternalLink size={13} color="#94a3b8" style={{ marginLeft: 'auto' }} />
                                                </div>
                                                <p style={{ margin: '0', fontSize: '0.8rem', color: '#475569', lineHeight: '1.4' }}>{db.tip}</p>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                                {/* AI Generator for Marco Contextual */}
                                <div style={{ background: 'linear-gradient(to right, #fffbeb, #fef3c7)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #fcd34d' }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#d97706', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>✨</span> Generador de Guía del Marco Contextual con IA
                                    </h4>
                                    <p style={{ color: '#334155', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.5' }}>Ingresa tu título y la IA generará: dimensiones a explorar, sugerencias de fuentes y un ejemplo descriptivo del entorno del problema.</p>
                                    <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                                        <label style={{ fontSize: '0.85rem' }}>Título de tu Investigación</label>
                                        <input type="text" className="input-field" placeholder="Ej: Brecha digital en escuelas rurales del municipio X..." value={contextualTitle} onChange={(e) => setContextualTitle(e.target.value)} style={{ padding: '0.65rem' }} />
                                    </div>
                                    <button onClick={handleGenerateContextual} disabled={isGeneratingContextual || !contextualTitle.trim()}
                                        style={{ width: '100%', padding: '0.75rem', background: isGeneratingContextual || !contextualTitle.trim() ? '#94a3b8' : 'linear-gradient(to right, #d97706, #b45309)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: isGeneratingContextual || !contextualTitle.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.95rem', transition: 'all 0.2s' }}>
                                        {isGeneratingContextual ? (<><span style={{ animation: 'spin 1s linear infinite' }}>⌛</span> Generando...</>) : (<><span style={{ fontSize: '1.1rem' }}>🌍</span> Generar Dimensiones del Contexto</>)}
                                    </button>
                                    {contextualResult && (
                                        <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'white', border: '2px solid #fcd34d', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)' }}>
                                            <h5 style={{ margin: '0 0 0.75rem 0', color: '#d97706', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ fontSize: '1.2rem' }}>📋</span> Guía Generada</h5>
                                            <div style={{ color: '#1e293b', fontSize: '0.92rem', lineHeight: '1.75', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{contextualResult}</div>
                                        </div>
                                    )}
                                    {contextualError && (
                                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem' }}>
                                            <p style={{ margin: '0', color: '#991b1b', fontSize: '0.85rem' }}>⚠️ {contextualError}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Writing Example */}
                                <div style={{
                                    background: 'rgba(255,255,255,0.9)',
                                    borderRadius: '0.75rem',
                                    padding: '1.5rem',
                                    border: '1px solid #fde68a',
                                    marginTop: '1.25rem'
                                }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#d97706', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FileText size={20} /> Ejemplo de Descripción Contextual
                                    </h4>
                                    <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                                        A continuación se presenta un ejemplo de cómo redactar la descripción del contexto poblacional y geográfico integrando datos oficiales. Observe el uso de estadísticas para fundamentar la exposición.
                                    </p>

                                    {/* Example paragraph */}
                                    <div style={{
                                        background: '#fffbeb',
                                        borderLeft: '4px solid #d97706',
                                        borderRadius: '0 0.5rem 0.5rem 0',
                                        padding: '1.25rem 1.5rem',
                                        marginBottom: '1rem',
                                        fontSize: '0.92rem',
                                        color: '#1e293b',
                                        lineHeight: '1.85',
                                        fontStyle: 'italic'
                                    }}>
                                        <p style={{ margin: '0 0 1rem 0' }}>
                                            <span style={{ background: '#fef3c7', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#d97706', verticalAlign: 'super' }}>CONTEXTO GEOGRÁFICO</span>{' '}
                                            La presente investigación se enmarca en la ciudad de Bogotá D.C., Colombia, de manera específica en la Localidad de Ciudad Bolívar.
                                            {' '}<span style={{ background: '#fef3c7', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#d97706', verticalAlign: 'super' }}>DATOS DEMOGRÁFICOS</span>{' '}
                                            De acuerdo con el Departamento Administrativo Nacional de Estadística (DANE, 2022), esta localidad cuenta con una población que supera los 600.000 habitantes, caracterizándose por ser una de las zonas receptoras de población más representativas de la ciudad, con un alto predominio de estratos socioeconómicos 1 y 2.
                                        </p>
                                        <p style={{ margin: '0' }}>
                                            <span style={{ background: '#fef3c7', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#d97706', verticalAlign: 'super' }}>VÍNCULO CON EL PROBLEMA</span>{' '}
                                            Las dinámicas socioeconómicas del sector han propiciado retos estructurales en el acceso a la conectividad digital (Secretaría Distrital de Planeación, 2021). 
                                            {' '}<span style={{ background: '#fef3c7', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#d97706', verticalAlign: 'super' }}>CONTEXTO INSTITUCIONAL</span>{' '}
                                            En este escenario se inscribe la Institución Educativa Distrital San Francisco, entidad de carácter público que atiende a una población de 1.200 estudiantes en jornada mañana y tarde, la cual presenta un déficit en infraestructura tecnológica de acuerdo con su Proyecto Educativo Institucional (IED San Francisco, 2022).
                                        </p>
                                    </div>

                                    {/* Structure labels */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                                        {[
                                            { label: 'Contexto espacial macro', desc: 'Inicie ubicando geográficamente al lector (país, ciudad).' },
                                            { label: 'Datos oficiales estadísticos', desc: 'Respalde los datos demográficos y económicos con citas.' },
                                            { label: 'Vínculo con el problema', desc: 'Muestre que las condiciones afectan la problemática tratada.' },
                                            { label: 'Contexto micro / institucional', desc: 'Describa el lugar concreto donde se interviene.' },
                                            { label: 'Uso y análisis de informes', desc: 'Mencione documentación local (PEI, planes de gobierno).' },
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'start' }}>
                                                <div style={{ background: '#d97706', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '700', flexShrink: 0, marginTop: '0.1rem' }}>✓</div>
                                                <div>
                                                    <strong style={{ color: '#b45309', fontSize: '0.82rem' }}>{item.label}</strong>
                                                    <p style={{ margin: '0', color: '#475569', fontSize: '0.78rem', lineHeight: '1.4' }}>{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Extra content for Marco Legal tab */}
                        {activeMarcoTab === 'legal' && activeMarcoData.searchGuide && (
                            <div style={{ marginTop: '1.5rem' }}>
                                {/* Search Guide */}
                                <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #fca5a5', marginBottom: '1.25rem' }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#dc2626', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Search size={20} /> {activeMarcoData.searchGuide.title}
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {activeMarcoData.searchGuide.steps.map((s, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                                                <div style={{ background: '#dc2626', color: 'white', borderRadius: '0.375rem', padding: '0.2rem 0.55rem', fontSize: '0.75rem', fontWeight: '700', flexShrink: 0, marginTop: '0.15rem' }}>{i + 1}</div>
                                                <div>
                                                    <strong style={{ color: '#991b1b', fontSize: '0.9rem' }}>{s.step.replace(/^\d+\.\s*/, '')}</strong>
                                                    <p style={{ margin: '0.2rem 0 0', color: '#334155', fontSize: '0.85rem', lineHeight: '1.55' }}>{s.detail}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Databases */}
                                <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #fca5a5', marginBottom: '1.25rem' }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#dc2626', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Database size={20} /> Bases de datos y fuentes recomendadas
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                                        {activeMarcoData.searchGuide.databases.map((db, i) => (
                                            <a key={i} href={db.url} target="_blank" rel="noopener noreferrer"
                                                style={{ background: 'white', borderRadius: '0.5rem', padding: '0.85rem', border: '1px solid #fca5a5', textDecoration: 'none', transition: 'transform 0.15s, box-shadow 0.15s', display: 'block' }}
                                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                                                    <span style={{ fontWeight: '600', color: '#dc2626', fontSize: '0.9rem' }}>{db.name}</span>
                                                    <ExternalLink size={13} color="#94a3b8" style={{ marginLeft: 'auto' }} />
                                                </div>
                                                <p style={{ margin: '0', fontSize: '0.8rem', color: '#475569', lineHeight: '1.4' }}>{db.tip}</p>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                                {/* AI Generator for Marco Legal */}
                                <div style={{ background: 'linear-gradient(to right, #fef2f2, #fee2e2)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #f87171' }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#dc2626', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>✨</span> Generador de Guía del Marco Legal con IA
                                    </h4>
                                    <p style={{ color: '#334155', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.5' }}>Ingresa tu título y la IA generará: pirámide normativa aplicable, entidades reguladoras, palabras clave de búsqueda y un ejemplo redactado.</p>
                                    <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                                        <label style={{ fontSize: '0.85rem' }}>Título de tu Investigación</label>
                                        <input type="text" className="input-field" placeholder="Ej: Cumplimiento de derechos laborales en plataformas digitales..." value={legalTitle} onChange={(e) => setLegalTitle(e.target.value)} style={{ padding: '0.65rem' }} />
                                    </div>
                                    <button onClick={handleGenerateLegal} disabled={isGeneratingLegal || !legalTitle.trim()}
                                        style={{ width: '100%', padding: '0.75rem', background: isGeneratingLegal || !legalTitle.trim() ? '#94a3b8' : 'linear-gradient(to right, #dc2626, #b91c1c)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: isGeneratingLegal || !legalTitle.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.95rem', transition: 'all 0.2s' }}>
                                        {isGeneratingLegal ? (<><span style={{ animation: 'spin 1s linear infinite' }}>⌛</span> Generando...</>) : (<><span style={{ fontSize: '1.1rem' }}>⚖️</span> Generar Estructura Legal</>)}
                                    </button>
                                    {legalResult && (
                                        <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'white', border: '2px solid #f87171', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)' }}>
                                            <h5 style={{ margin: '0 0 0.75rem 0', color: '#dc2626', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ fontSize: '1.2rem' }}>📋</span> Guía Generada</h5>
                                            <div style={{ color: '#1e293b', fontSize: '0.92rem', lineHeight: '1.75', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{legalResult}</div>
                                        </div>
                                    )}
                                    {legalError && (
                                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem' }}>
                                            <p style={{ margin: '0', color: '#991b1b', fontSize: '0.85rem' }}>⚠️ {legalError}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Writing Example */}
                                <div style={{
                                    background: 'rgba(255,255,255,0.9)',
                                    borderRadius: '0.75rem',
                                    padding: '1.5rem',
                                    border: '1px solid #fca5a5',
                                    marginTop: '1.25rem'
                                }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#dc2626', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FileText size={20} /> Ejemplo de Análisis Normativo
                                    </h4>
                                    <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                                        A continuación se presenta un ejemplo de cómo redactar la descripción de una norma. Note cómo no solo se cita, sino que se analiza su impacto directo en el proyecto.
                                    </p>

                                    {/* Example paragraph */}
                                    <div style={{
                                        background: '#fef2f2',
                                        borderLeft: '4px solid #dc2626',
                                        borderRadius: '0 0.5rem 0.5rem 0',
                                        padding: '1.25rem 1.5rem',
                                        marginBottom: '1rem',
                                        fontSize: '0.92rem',
                                        color: '#1e293b',
                                        lineHeight: '1.85',
                                        fontStyle: 'italic'
                                    }}>
                                        <p style={{ margin: '0 0 1rem 0' }}>
                                            <span style={{ background: '#fee2e2', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#dc2626', verticalAlign: 'super' }}>CITA DE LA NORMA</span>{' '}
                                            En el ámbito nacional, la Ley 1581 de 2012, dictada por el Congreso de la República de Colombia, constituye el marco general para la protección de datos personales.
                                            {' '}<span style={{ background: '#fee2e2', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#dc2626', verticalAlign: 'super' }}>PROPÓSITO DE LEY</span>{' '}
                                            Esta disposición estatutaria tiene por objeto desarrollar el derecho constitucional que tienen todas las personas a conocer, actualizar y rectificar las informaciones que se hayan recogido sobre ellas en bases de datos o archivos.
                                        </p>
                                        <p style={{ margin: '0' }}>
                                            <span style={{ background: '#fee2e2', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#dc2626', verticalAlign: 'super' }}>ANÁLISIS DE APLICACIÓN</span>{' '}
                                            Para los propósitos de esta investigación, el cumplimiento de los Artículos 9 y 12 resulta de carácter vinculante e imperativo. 
                                            {' '}<span style={{ background: '#fee2e2', padding: '0.1rem 0.35rem', borderRadius: '0.2rem', fontStyle: 'normal', fontSize: '0.7rem', fontWeight: '700', color: '#dc2626', verticalAlign: 'super' }}>DESENLACE PRÁCTICO</span>{' '}
                                            Dado que la plataforma de telemedicina propuesta en el Capítulo 4 almacenará información clínica (datos sensibles), la aplicación de esta ley obliga al diseño de protocolos extra de encriptación y al desarrollo de un formulario explícito de consentimiento informado previo.
                                        </p>
                                    </div>

                                    {/* Structure labels */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                                        {[
                                            { label: 'Cita de la Norma', desc: 'Identifica claramente el tipo de norma, número y año.' },
                                            { label: 'Propósito General', desc: 'Sintetiza de qué trata la norma (sin copiarla toda).' },
                                            { label: 'Análisis de Aplicación', desc: 'Enfócate en los artículos específicos que te afectan.' },
                                            { label: 'Desenlace Práctico', desc: 'Concluye qué debes hacer en tu investigación para cumplirla.' },
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'start' }}>
                                                <div style={{ background: '#dc2626', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '700', flexShrink: 0, marginTop: '0.1rem' }}>✓</div>
                                                <div>
                                                    <strong style={{ color: '#991b1b', fontSize: '0.82rem' }}>{item.label}</strong>
                                                    <p style={{ margin: '0', color: '#475569', fontSize: '0.78rem', lineHeight: '1.4' }}>{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Norms Suggestion Card */}
                                <div style={{ background: 'linear-gradient(to right, #fef2f2, #fee2e2)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #fca5a5', marginTop: '1.5rem' }}>
                                    <h4 style={{ fontSize: '1.05rem', color: '#b91c1c', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>💡</span> Explorador Rápido de Normativas
                                    </h4>
                                    <p style={{ color: '#991b1b', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.5' }}>¿No estás seguro de qué leyes aplican a tu estudio? Ingresa tu título y la IA te sugerirá las ramas del derecho, leyes o regulaciones que debes explorar.</p>
                                    <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#991b1b' }}>Título de tu Investigación</label>
                                        <input type="text" className="input-field" placeholder="Ej: Implementación de comercio electrónico en..." value={suggestedNormsTitle} onChange={(e) => setSuggestedNormsTitle(e.target.value)} style={{ padding: '0.65rem', borderColor: '#fca5a5' }} />
                                    </div>
                                    <button onClick={handleSuggestNorms} disabled={isGeneratingNorms || !suggestedNormsTitle.trim()}
                                        style={{ width: '100%', padding: '0.75rem', background: isGeneratingNorms || !suggestedNormsTitle.trim() ? '#fca5a5' : 'linear-gradient(to right, #ef4444, #dc2626)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: isGeneratingNorms || !suggestedNormsTitle.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.95rem', transition: 'all 0.2s' }}>
                                        {isGeneratingNorms ? (<><span style={{ animation: 'spin 1s linear infinite' }}>⌛</span> Buscando normas...</>) : (<><span style={{ fontSize: '1.1rem' }}>🧠</span> Sugerir Normativas</>)}
                                    </button>
                                    {suggestedNormsResult && (
                                        <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'white', border: '2px solid #fca5a5', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)' }}>
                                            <h5 style={{ margin: '0 0 0.75rem 0', color: '#dc2626', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ fontSize: '1.2rem' }}>📌</span> Normativas Sugeridas</h5>
                                            <div style={{ color: '#1e293b', fontSize: '0.92rem', lineHeight: '1.75', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{suggestedNormsResult}</div>
                                        </div>
                                    )}
                                    {normsError && (
                                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem' }}>
                                            <p style={{ margin: '0', color: '#991b1b', fontSize: '0.85rem' }}>⚠️ {normsError}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
};

export default MarcoReferencial;
