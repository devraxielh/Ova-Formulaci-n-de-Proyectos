/*
 * Niveles de los verbos de objetivos, de lo simple a lo complejo.
 * El objetivo general es el peldaño más alto; los específicos suben hacia él.
 */
export const NIVELES = [
    {
        nivel: 1, nombre: 'Identificar',
        verbs: ['Identificar', 'Reconocer', 'Enumerar', 'Registrar', 'Definir', 'Recopilar', 'Inventariar', 'Detectar', 'Delimitar',
            'Indagar', 'Explorar', 'Localizar', 'Ubicar', 'Listar', 'Nombrar', 'Señalar', 'Seleccionar', 'Rastrear', 'Recolectar', 'Observar', 'Precisar'],
    },
    {
        nivel: 2, nombre: 'Describir',
        verbs: ['Describir', 'Caracterizar', 'Clasificar', 'Cuantificar', 'Diagnosticar', 'Medir', 'Categorizar', 'Sistematizar', 'Documentar',
            'Tipificar', 'Perfilar', 'Mapear', 'Representar', 'Resumir', 'Ilustrar', 'Esquematizar', 'Ordenar', 'Agrupar', 'Detallar', 'Exponer', 'Organizar'],
    },
    {
        nivel: 3, nombre: 'Analizar',
        verbs: ['Analizar', 'Comparar', 'Contrastar', 'Diferenciar', 'Relacionar', 'Correlacionar', 'Asociar', 'Establecer', 'Examinar',
            'Interpretar', 'Calcular', 'Priorizar', 'Jerarquizar', 'Distinguir', 'Discriminar', 'Descomponer', 'Desglosar', 'Vincular', 'Confrontar',
            'Contextualizar', 'Triangular', 'Segmentar', 'Integrar'],
    },
    {
        nivel: 4, nombre: 'Explicar',
        verbs: ['Explicar', 'Determinar', 'Inferir', 'Predecir', 'Estimar', 'Deducir', 'Demostrar', 'Fundamentar', 'Argumentar', 'Justificar',
            'Pronosticar', 'Proyectar', 'Modelar', 'Atribuir', 'Concluir', 'Generalizar'],
    },
    {
        nivel: 5, nombre: 'Evaluar',
        verbs: ['Evaluar', 'Valorar', 'Validar', 'Verificar', 'Comprobar', 'Ajustar', 'Juzgar', 'Ponderar', 'Calificar', 'Auditar',
            'Monitorear', 'Revisar', 'Criticar', 'Dictaminar', 'Calibrar', 'Certificar', 'Retroalimentar'],
    },
    {
        nivel: 6, nombre: 'Proponer',
        verbs: ['Proponer', 'Diseñar', 'Formular', 'Elaborar', 'Construir', 'Desarrollar', 'Plantear', 'Estructurar', 'Recomendar', 'Optimizar',
            'Fortalecer', 'Socializar', 'Divulgar', 'Crear', 'Generar', 'Planificar', 'Programar', 'Producir', 'Adaptar', 'Rediseñar', 'Idear',
            'Concebir', 'Prototipar', 'Promover', 'Transferir', 'Innovar'],
    },
];

export const MAX_NIVEL = NIVELES.length;

const INDICE = new Map(NIVELES.flatMap(({ nivel, verbs }) => verbs.map((verb) => [verb.toLowerCase(), nivel])));

// Nivel del verbo con que empieza un objetivo (0 si no se reconoce).
export const nivelDe = (texto) => INDICE.get(String(texto || '').trim().split(/\s+/)[0]?.toLowerCase() || '') || 0;

export const nombreNivel = (nivel) => NIVELES.find((item) => item.nivel === nivel)?.nombre || '';

// Rango de niveles de cada peldaño: se reparte de 1 hasta el nivel del general, de forma ascendente.
export const rangoPeldano = (indice, total, nivelGeneral) => {
    const tope = nivelGeneral || MAX_NIVEL;
    const n = Math.max(total, 1);
    const desde = Math.min(tope, 1 + Math.floor((indice * tope) / n));
    const hasta = Math.max(desde, Math.min(tope, Math.ceil(((indice + 1) * tope) / n)));
    return [desde, hasta];
};

export const verbosEntre = ([desde, hasta]) => NIVELES.filter(({ nivel }) => nivel >= desde && nivel <= hasta);

// Problemas de la escalera: un específico por encima del general o por debajo del anterior.
export const problemasEscalera = (general, especificos) => {
    const tope = nivelDe(general);
    let previo = 0;
    return especificos.map((texto) => {
        const nivel = nivelDe(texto);
        if (!String(texto || '').trim() || !nivel) return '';
        let problema = '';
        if (tope && nivel > tope) problema = 'arriba';
        else if (nivel < previo) problema = 'baja';
        if (problema !== 'arriba') previo = Math.max(previo, nivel);
        return problema;
    });
};
