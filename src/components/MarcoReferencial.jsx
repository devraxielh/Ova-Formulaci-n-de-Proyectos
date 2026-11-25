import React, { useState } from 'react';
import EditorRico from './EditorRico';
import {
    AlertTriangle, ArrowRight, BookOpen, CheckCircle2, ExternalLink, Layers, Library, MapPin, Plus, Quote, Scale, Search, Target, Trash2,
} from 'lucide-react';
import SlideDeck, { Opciones, Pestanas } from './deck/SlideDeck';
import { useProjectField } from '../context/ProjectContext';
import { useAutoGuardar } from '../hooks/useAutoGuardar';
import { SECTIONS, SLIDES } from '../data/marcoClase';
import { Generica } from './deck/Contenido';
import './Titulo.css';
import './Planteamiento.css';
import './Objetivos.css';
import './Justificacion.css';
import BuscarAntecedentes from './BuscarAntecedentes';
import BuscarNormas from './BuscarNormas';
import SugerirTeorias from './SugerirTeorias';
import { autorCita } from '../services/apa';
import { groq } from '../services/api';
import './Marco.css';
import './Alcances.css';
import { Integrado, SinFuente } from './MarcoFuentes';
import TEORIA from '../data/teoria/marco';

/* Clase larga de 4 horas: el contenido de cada diapositiva está en data/marcoClase.js. */

const SLIDE_KEY = 'projectsia:marco:diapositiva';
const ANIO_ACTUAL = new Date().getFullYear();
const RECIENTE = ANIO_ACTUAL - 10;

/* ---------- Utilidades ---------- */

const clean = (text) => String(text || '').trim().replace(/[\s.,;:]+$/, '');
// El autor tal como va en la cita: «et al.» conserva su punto (clean se lo quita por ir al final).
const autorDe = (v) => clean(v).replace(/\bet al$/i, 'et al.');
const lower = (text) => (text ? text.charAt(0).toLowerCase() + text.slice(1) : '');
const capital = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : '');
const countWords = (text) => String(text || '').trim().split(/\s+/).filter(Boolean).length;

/* ---------- Los cinco apartados ---------- */

const APARTADOS = [
    { key: 'antecedentes', field: 'marcoAntecedentes', label: 'Antecedentes', icon: Library, pregunta: '¿Qué se ha investigado sobre el tema?' },
    { key: 'teorico', field: 'marcoTeorico', label: 'Marco Teórico', icon: Layers, pregunta: '¿Qué teorías explican el problema?' },
    { key: 'conceptual', field: 'marcoConceptual', label: 'Marco Conceptual', icon: BookOpen, pregunta: '¿Qué significa cada término clave?' },
    { key: 'contextual', field: 'marcoContextual', label: 'Marco Contextual', icon: MapPin, pregunta: '¿Dónde y con quiénes ocurre?' },
    { key: 'legal', field: 'marcoLegal', label: 'Marco Legal', icon: Scale, pregunta: '¿Qué normas lo regulan?' },
];

const AMBITOS = ['Internacional', 'Nacional', 'Regional o local'];
const TIPOS_NORMA = ['Constitución Política', 'Ley', 'Decreto', 'Resolución', 'Acuerdo u ordenanza', 'Sentencia', 'Norma institucional'];

const VACIO = {
    antecedente: { autor: '', anio: '', titulo: '', ambito: 'Nacional', lugar: '', objetivo: '', hallazgo: '', relacion: '' },
    teoria: { nombre: '', autor: '', anio: '', postulado: '', relacion: '' },
    concepto: { termino: '', definicion: '', autor: '', anio: '' },
    norma: { tipo: 'Ley', numero: '', anio: '', establece: '', relacion: '' },
};

const MARCO_FORM = {
    antecedentes: [{ ...VACIO.antecedente }],
    teorias: [{ ...VACIO.teoria }],
    conceptos: [{ ...VACIO.concepto }],
    contexto: { lugar: '', caracteristicas: '', institucion: '', poblacion: '' },
    normas: [{ ...VACIO.norma }],
};

/* ---------- Redacción automática de cada apartado ---------- */

const redactarAntecedentes = (items) => AMBITOS.flatMap((ambito) => items
    .filter((a) => a.ambito === ambito && clean(a.autor) && clean(a.hallazgo))
    .map((a) => {
        const partes = [
            `${autorDe(a.autor)} (${clean(a.anio) || 's. f.'})${clean(a.titulo) ? `, en su estudio «${clean(a.titulo)}»` : ''}${clean(a.lugar) ? `, realizado en ${clean(a.lugar)}` : ''}${clean(a.objetivo) ? `, buscó ${lower(clean(a.objetivo))}` : ''}.`,
            `${capital(clean(a.hallazgo))}.`,
            clean(a.relacion) ? `Este antecedente se relaciona con la presente investigación porque ${lower(clean(a.relacion))}.` : '',
        ];
        return partes.filter(Boolean).join(' ');
    })).join('\n\n');

const redactarTeorias = (items) => items
    .filter((t) => clean(t.nombre) && clean(t.postulado))
    .map((t) => [
        `${capital(clean(t.nombre))}${clean(t.autor) ? `, propuesta por ${autorDe(t.autor)} (${clean(t.anio) || 's. f.'})` : ''}, plantea que ${lower(clean(t.postulado))}.`,
        clean(t.relacion) ? `Esta teoría sustenta la investigación porque ${lower(clean(t.relacion))}.` : '',
    ].filter(Boolean).join(' '))
    .join('\n\n');

const redactarConceptos = (items) => items
    .filter((c) => clean(c.termino) && clean(c.definicion))
    .map((c) => `- **${capital(clean(c.termino))}:** ${capital(clean(c.definicion))}${clean(c.autor) ? ` (${autorDe(c.autor)}, ${clean(c.anio) || 's. f.'})` : ''}.`)
    .join('\n');

const redactarContexto = (c) => [
    clean(c.lugar) ? `La investigación se desarrolla en ${clean(c.lugar)}.` : '',
    clean(c.caracteristicas) ? `${capital(clean(c.caracteristicas))}.` : '',
    clean(c.institucion) ? `${capital(clean(c.institucion))}.` : '',
    clean(c.poblacion) ? `${capital(clean(c.poblacion))}.` : '',
].filter(Boolean).join(' ');

const nombreNorma = (n) => {
    const num = clean(n.numero);
    const anio = clean(n.anio) ? ` de ${clean(n.anio)}` : '';
    switch (n.tipo) {
        case 'Constitución Política': return `La Constitución Política de Colombia de 1991${num ? `, en su artículo ${num},` : ''}`;
        case 'Ley': return `La Ley ${num}${anio}`;
        case 'Decreto': return `El Decreto ${num}${anio}`;
        case 'Resolución': return `La Resolución ${num}${anio}`;
        case 'Acuerdo u ordenanza': return `El acuerdo ${num}${anio}`;
        case 'Sentencia': return `La Sentencia ${num}${anio}`;
        default: return `${capital(num)}${anio}`;
    }
};

const redactarNormas = (items) => [...items]
    .filter((n) => clean(n.establece) && (clean(n.numero) || n.tipo === 'Constitución Política'))
    .sort((x, y) => TIPOS_NORMA.indexOf(x.tipo) - TIPOS_NORMA.indexOf(y.tipo))
    .map((n) => {
        const nombre = nombreNorma(n);
        return [
            `${nombre} establece ${lower(clean(n.establece))}.`,
            clean(n.relacion) ? `Se relaciona con el estudio porque ${lower(clean(n.relacion))}.` : '',
        ].filter(Boolean).join(' ');
    })
    .join('\n\n');

// Si el estudiante pidió la redacción integrada de un apartado (f.integrado), ese texto reemplaza al de un párrafo por ficha.
const redactar = (f) => ({
    marcoAntecedentes: String(f.integrado?.antecedentes || '').trim() || redactarAntecedentes(f.antecedentes),
    marcoTeorico: String(f.integrado?.teorico || '').trim() || redactarTeorias(f.teorias),
    marcoConceptual: redactarConceptos(f.conceptos),
    marcoContextual: redactarContexto(f.contexto),
    marcoLegal: redactarNormas(f.normas),
});

const unir = (partes) => APARTADOS.map((a) => (clean(partes[a.field]) ? `## ${a.label}\n${partes[a.field].trim()}` : '')).filter(Boolean).join('\n\n');

/* ---------- Revisión automática ---------- */

const separar = (text) => {
    const out = {};
    let actual = null;
    String(text || '').split('\n').forEach((line) => {
        const head = line.trim().replace(/^#+\s*/, '').replace(/[:.]$/, '').toLowerCase();
        const match = APARTADOS.find((a) => head === a.label.toLowerCase());
        if (match) { actual = match.key; out[actual] = ''; return; }
        if (actual) out[actual] += `${line}\n`;
    });
    return out;
};

const checkMarco = (text, { quien, donde }) => {
    const p = separar(text);
    const all = String(text || '');
    const ant = (p.antecedentes || '').split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
    const anios = (p.antecedentes || '').match(/\((?:[^)]*?)((?:19|20)\d{2})\)/g) || [];
    const yearsAnt = anios.map((x) => Number(x.match(/(19|20)\d{2}/)[0]));
    const recientes = yearsAnt.filter((y) => y >= RECIENTE).length;
    const conceptos = (p.conceptual || '').split('\n').filter((line) => /:/.test(line) && line.trim().length > 10);
    const normas = (p.legal || '').split(/\n\s*\n/).filter((x) => /ley|decreto|resoluci|constituci|acuerdo|ordenanza|reglamento|norma/i.test(x));
    const citas = (all.match(/\([^()]*?(19|20)\d{2}[^()]*?\)|\(s\. f\.\)/g) || []).length;
    const clave = (value) => clean(value).toLowerCase().split(/[\s,]+/).filter((word) => word.length > 3)[0];
    return [
        { id: 'apartados', ok: APARTADOS.every((a) => clean(p[a.key])), label: 'Tiene los cinco apartados', detail: `Faltan: ${APARTADOS.filter((a) => !clean(p[a.key])).map((a) => a.label).join(', ') || '—'}.` },
        { id: 'antecedentes', ok: ant.length >= 3, label: 'Presenta al menos tres antecedentes', detail: `Tiene ${ant.length}. Lo usual es entre 5 y 10, de distintos ámbitos.` },
        { id: 'recientes', ok: yearsAnt.length > 0 && recientes >= Math.ceil(yearsAnt.length * 0.7), label: `Los antecedentes son recientes (desde ${RECIENTE})`, detail: `${recientes} de ${yearsAnt.length} son de los últimos diez años.` },
        { id: 'relacion', ok: ant.length > 0 && ant.every((x) => /se relaciona|aporta|sirve|es útil|permite/i.test(x)), label: 'Cada antecedente dice cómo se relaciona con tu estudio', detail: 'Cierra cada antecedente con «Este antecedente se relaciona con la presente investigación porque…».' },
        { id: 'teoria', ok: /\((?:[^)]*?)(19|20)\d{2}\)|propuesta por/i.test(p.teorico || '') && countWords(p.teorico) >= 40, label: 'El Marco Teórico nombra teorías con su autor', detail: 'Presenta al menos una teoría con su autor y año, y explica su postulado.' },
        { id: 'sustenta', ok: /sustenta|explica|permite comprender|se relaciona|aplica/i.test(p.teorico || ''), label: 'Explica por qué la teoría sustenta el estudio', detail: '«Esta teoría sustenta la investigación porque…».' },
        { id: 'conceptos', ok: conceptos.length >= 3, label: 'Define al menos tres conceptos', detail: `Tiene ${conceptos.length}. Define tus variables y los términos clave de tu título.` },
        { id: 'contexto', ok: (!clave(donde) || (p.contextual || '').toLowerCase().includes(clave(donde))) && (!clave(quien) || (p.contextual || '').toLowerCase().includes(clave(quien))), label: 'El contexto describe tu lugar y tu población', detail: `Tu lugar es «${clean(donde) || '—'}» y tu población «${clean(quien) || '—'}».` },
        { id: 'normas', ok: normas.length >= 2, label: 'Cita al menos dos normas', detail: `Tiene ${normas.length}. Ordénalas de la Constitución a las normas institucionales.` },
        { id: 'citas', ok: citas >= 6, label: 'Cita sus fuentes en APA', detail: `Tiene ${citas} citas con año. Cada antecedente, teoría y concepto debe llevar (Autor, año).` },
        { id: 'pendientes', ok: !/\[[^\]]{3,}\]/.test(all), label: 'No quedan partes por completar', detail: 'Reemplaza los textos entre corchetes [ … ].' },
    ];
};

/* ---------- Piezas visuales ---------- */


/* ---------- Constructor ---------- */

// «Ley 1751 de 2015», «Decreto 780 de 2016», «T-265 de 2020»… → tipo, número y año de la ficha de norma.
const normaDeCita = (cita, anio) => {
    const c = String(cita || '');
    const y = (c.match(/\bde\s+((?:19|20)\d{2})\b/) || [])[1] || (anio ? String(anio) : '');
    const ley = c.match(/\b(Ley|Decreto|Resoluci[oó]n|Acuerdo|Ordenanza)\s+(?:Estatutaria\s+|Ley\s+)?(?:N[°ºo.]*\s*)?(\d[\d.]*)/i);
    if (ley) {
        const t = ley[1].toLowerCase();
        return { tipo: t === 'ley' ? 'Ley' : t === 'decreto' ? 'Decreto' : t.startsWith('resol') ? 'Resolución' : 'Acuerdo u ordenanza', numero: ley[2].replace(/\./g, ''), anio: y };
    }
    const sentencia = c.match(/\b((?:SU|[CTA])-?\s?\d+[A-Z]?)(?:\s+de\s+|\/)(\d{2,4})\b/i);
    if (sentencia) return { tipo: 'Sentencia', numero: sentencia[1].toUpperCase().replace(/\s/g, ''), anio: y || (sentencia[2].length === 2 ? `20${sentencia[2]}` : sentencia[2]) };
    if (/constituci[oó]n pol[ií]tica/i.test(c)) return { tipo: 'Constitución Política', numero: '', anio: '' };
    // Sentencias de otras cortes: se identifican por su radicado.
    return { tipo: 'Sentencia', numero: c.replace(/^.*?-\s*SENTENCIA\s*-\s*/i, '').slice(0, 80), anio: y };
};

// Qué ficha se arma en cada apartado que tiene búsqueda, y qué se le pide a la IA que saque del resumen.
// Pocos conceptos y bien definidos: solo los fundamentales del proyecto.
const MAX_CONCEPTOS = 6;

const FICHA_DE = {
    antecedentes: {
        tipo: 'antecedente', nombre: 'antecedente', buscar: 'Buscar artículos sobre tu tema', lista: 'antecedentes', max: 10,
        campos: ['objetivo', 'hallazgo', 'titulo'], reemplaza: ['ambito'],
        base: (ref) => ({ ...VACIO.antecedente, autor: autorCita(ref), anio: ref.anio, titulo: ref.titulo, ambito: 'Internacional' }),
    },
    teorico: {
        tipo: 'teoria', nombre: 'teoría', lista: 'teorias', max: 5,
        campos: ['nombre', 'postulado'], reemplaza: ['autor', 'anio'],
        base: (ref) => ({ ...VACIO.teoria, autor: autorCita(ref), anio: ref.anio }),
    },
    legal: {
        tipo: 'norma', nombre: 'norma', lista: 'normas', max: 10,
        campos: ['numero', 'establece'],
        base: (ref) => ({ ...VACIO.norma, ...normaDeCita(ref.cita, ref.anio) }),
    },
    conceptual: {
        tipo: 'concepto', nombre: 'concepto', lista: 'conceptos', max: MAX_CONCEPTOS,
        campos: ['termino', 'definicion'],
        base: (ref) => ({ ...VACIO.concepto, autor: autorCita(ref), anio: ref.anio }),
    },
};

const PIDE = {
    antecedente: {
        que: 'fichar un antecedente de investigación',
        campos: `- "objetivo": qué buscó el estudio y cómo lo hizo (método, muestra o instrumento, si el resumen lo dice). Una o dos frases que empiecen con un verbo en infinitivo en minúscula. Ejemplo solo de forma: «comparar el consumo de agua de dos barrios mediante mediciones mensuales en 150 hogares».
- "hallazgo": qué encontró, con las cifras que dé el resumen. Una o dos frases que empiecen en minúscula. Cadena vacía si el resumen no informa resultados.
- "relacion": cómo se relaciona con el proyecto del estudiante (qué le aporta: una variable, un método, un resultado para comparar). Una frase que empiece con un verbo en tercera persona en minúscula. Ejemplo solo de forma: «aporta un instrumento que puede adaptarse a esta población».
- "lugar": país, ciudad o institución donde se hizo el estudio, tal como lo diga el resumen. Cadena vacía si no lo dice.
- "ambito": "Regional o local" si se hizo en la misma ciudad, departamento o región del proyecto; "Nacional" si se hizo en Colombia fuera de esa región; "Internacional" si fue en otro país o el resumen no dice dónde.`,
        json: '{"objetivo": "…", "hallazgo": "…", "relacion": "…", "lugar": "…", "ambito": "…"}',
    },
    teoria: {
        que: 'fichar la teoría o el modelo que sustenta un estudio',
        campos: `- "nombre": el nombre de la teoría, modelo o enfoque teórico principal que el artículo usa o propone, tal como lo nombra el resumen. Si tiene un nombre habitual en español, úsalo. Cadena vacía si el resumen no nombra ninguno.
- "postulado": qué plantea esa teoría o modelo, según el resumen. Una o dos frases que empiecen en minúscula. Ejemplo solo de forma: «el aprendizaje ocurre al relacionar la información nueva con lo que ya se sabe».
- "relacion": por qué esa teoría sirve para sustentar el proyecto del estudiante. Una frase que empiece con un verbo en tercera persona en minúscula. Ejemplo solo de forma: «permite explicar el comportamiento que este estudio observa».
- "autor": el autor original de la teoría SOLO si el resumen lo menciona; si no, cadena vacía.
- "anio": el año original de la teoría SOLO si el resumen lo menciona; si no, cadena vacía.`,
        json: '{"nombre": "…", "postulado": "…", "relacion": "…", "autor": "…", "anio": "…"}',
    },
    norma: {
        que: 'fichar una norma o sentencia para el marco legal',
        campos: `- "establece": qué establece o decide la norma o sentencia, según el extracto y su título. Una o dos frases que empiecen en minúscula y puedan seguir a «La Ley X establece…». Prefiere lo que más toque al proyecto del estudiante; si el extracto no lo toca, resume de qué trata la norma. Este campo SIEMPRE va lleno. Ejemplo solo de forma: «el derecho de los usuarios a recibir información clara sobre el servicio».
- "relacion": por qué se relaciona con el proyecto del estudiante: qué aspecto de su problema, su población o su actividad regula o protege. Una frase que empiece en minúscula y pueda seguir a «Se relaciona con el estudio porque…» (no repitas esas palabras). Este campo SIEMPRE va lleno; si la relación es indirecta, dilo así («regula de forma general…»). Ejemplo solo de forma: «regula la actividad que este estudio analiza».`,
        json: '{"establece": "…", "relacion": "…"}',
    },
    concepto: {
        que: 'fichar la definición de un concepto clave',
        campos: `- "termino": el concepto o variable principal que el artículo define o estudia y que más se relaciona con el proyecto del estudiante. De una a cinco palabras, con mayúscula inicial. Ejemplo solo de forma: «Deserción estudiantil».
- "definicion": cómo define o entiende ese concepto el artículo, según el resumen. Una o dos frases que empiecen en minúscula. Ejemplo solo de forma: «abandono de los estudios antes de obtener el título». Cadena vacía si el resumen no permite definirlo.`,
        json: '{"termino": "…", "definicion": "…"}',
    },
};

// Llena una ficha (antecedente, teoría o concepto) a partir del resumen del artículo. Solo usa lo que el resumen dice:
// lo que no aparece queda vacío para que el estudiante lo complete al leer el artículo.
const fichaDesdeResumen = async ({ tipo = 'antecedente', ref, resumen, proyecto }) => {
    const pide = PIDE[tipo];
    const r = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: `Ayudas a un estudiante a ${pide.que} a partir del resumen (abstract) de un artículo. Te basas únicamente en lo que dice el resumen: no inventas cifras, resultados, métodos, teorías, autores ni lugares. Si el resumen no dice algo, dejas ese campo como cadena vacía. Escribes en español aunque el resumen esté en otro idioma. Respondes solo JSON válido.` },
            { role: 'user', content: `ARTÍCULO\nTítulo: ${ref.titulo}\nAutores: ${ref.autores || ''}\nAño: ${ref.anio || ''}\nResumen: ${String(resumen).slice(0, 3500)}\n\nPROYECTO DEL ESTUDIANTE\nTítulo: ${proyecto.titulo || '(sin título)'}\nProblema: ${proyecto.problema || '(sin definir)'}\nPoblación: ${proyecto.quien || '(sin definir)'}\nLugar: ${proyecto.donde || '(sin definir)'}\n\nLlena la ficha:\n${pide.campos}\nLos ejemplos solo muestran la forma: no copies su contenido; escribe lo que diga este resumen.\nSin punto final en ningún campo.\n\nResponde exactamente con este JSON: ${pide.json}` },
        ],
        temperature: 0.2,
        max_tokens: 700,
        response_format: { type: 'json_object' },
    });
    const content = r.choices?.[0]?.message?.content || '';
    const json = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
    const t = (v, max = 600) => clean(String(v ?? '')).replace(/[.\s]+$/, '').slice(0, max);
    // El texto final ya antepone «se relaciona con el estudio porque…»: si la IA lo repite, se quita.
    const rel = (v) => t(v).replace(/^(?:se relaciona con (?:el|este) (?:estudio|proyecto)|este antecedente se relaciona con[^,]*?)\s+(?:porque|ya que|pues)\s+/i, '');
    if (tipo === 'teoria') return { nombre: t(json.nombre, 160), postulado: t(json.postulado), relacion: rel(json.relacion), autor: t(json.autor, 120), anio: (String(json.anio ?? '').match(/\b(1[5-9]|20)\d{2}\b/) || [''])[0] };
    if (tipo === 'concepto') return { termino: t(json.termino, 120), definicion: t(json.definicion) };
    // El texto final ya dice «La Ley X establece…»: si la IA empieza con «establece», se quita para no repetirlo.
    if (tipo === 'norma') return { establece: t(json.establece).replace(/^(?:establece|dispone|decide|señala)(?:\s+que)?\s+/i, ''), relacion: rel(json.relacion) };
    return { objetivo: t(json.objetivo), hallazgo: t(json.hallazgo), relacion: rel(json.relacion), lugar: t(json.lugar, 120), ambito: AMBITOS.includes(json.ambito) ? json.ambito : '' };
};

// «Qué plantea» y «Por qué sustenta tu estudio» de una teoría ya identificada (su nombre y su obra vienen de la búsqueda).
// Con resumen, se ciñe a él; sin resumen, la IA escribe solo el planteamiento central y conocido de la teoría.
const teoriaDesdeObra = async ({ nombre, ref, resumen, proyecto }) => {
    const hay = clean(resumen).length >= 80;
    const r = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: `Ayudas a un estudiante a fichar una teoría para su marco teórico. ${hay ? 'Explicas qué plantea la teoría basándote en el resumen (abstract) que recibes; no agregas cifras ni resultados que el resumen no diga.' : 'No hay resumen de la obra: escribes solo el planteamiento central y ampliamente conocido de esa teoría. Si no la conoces con certeza, dejas "postulado" como cadena vacía.'} No inventas autores, años ni citas. Escribes en español. Respondes solo JSON válido.` },
            { role: 'user', content: `TEORÍA: ${nombre}
OBRA: ${ref.titulo} (${ref.autores || 's. a.'}, ${ref.anio || 's. f.'})
${hay ? `Resumen: ${String(resumen).slice(0, 3500)}
` : ''}
PROYECTO DEL ESTUDIANTE
Título: ${proyecto.titulo || '(sin título)'}
Problema: ${proyecto.problema || '(sin definir)'}
Población: ${proyecto.quien || '(sin definir)'}
Lugar: ${proyecto.donde || '(sin definir)'}

Llena la ficha:
- "postulado": qué plantea la teoría. Una o dos frases que empiecen en minúscula y puedan seguir a «La teoría plantea que…» (no repitas esas palabras). Ejemplo solo de forma: «el aprendizaje ocurre al relacionar la información nueva con lo que ya se sabe».
- "relacion": por qué sirve para sustentar el proyecto del estudiante. Una frase que empiece en minúscula y pueda seguir a «Esta teoría sustenta la investigación porque…» (no repitas esas palabras). Este campo SIEMPRE va lleno. Ejemplo solo de forma: «permite explicar el comportamiento que este estudio observa».
Los ejemplos solo muestran la forma: no copies su contenido.
Sin punto final en ningún campo.

Responde exactamente con este JSON: {"postulado": "…", "relacion": "…"}` },
        ],
        temperature: 0.2,
        max_tokens: 600,
        response_format: { type: 'json_object' },
    });
    const content = r.choices?.[0]?.message?.content || '';
    const json = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
    const t = (v) => clean(String(v ?? '')).replace(/[.\s]+$/, '').slice(0, 600);
    return {
        postulado: t(json.postulado).replace(/^(?:(?:la|esta|el|este) (?:teor[ií]a|modelo|enfoque)[^,]*?\s+)?(?:plantea|postula|propone|sostiene)\s+que\s+/i, ''),
        relacion: t(json.relacion).replace(/^(?:esta teor[ií]a\s+)?sustenta (?:la|esta) investigaci[oó]n\s+(?:porque|ya que|pues)\s+/i, ''),
    };
};

// Definición de un concepto según el resumen de una obra. Si el resumen no lo define, queda vacía: no se le
// atribuye al autor una definición que no es suya.
const conceptoDesdeObra = async ({ termino, ref, resumen, proyecto }) => {
    const r = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'Ayudas a un estudiante a fichar la definición de un concepto para su marco conceptual. Te basas únicamente en el resumen (abstract) que recibes: la definición debe ser la que el resumen da o la forma en que el resumen entiende el concepto. No completas con lo que tú sabes ni inventas. La definición debe ser general: válida para el concepto en cualquier estudio, no la descripción del caso, la muestra o el procedimiento particular de ese artículo. Si el resumen no permite decir qué es el concepto en general, dejas "definicion" como cadena vacía. Escribes en español. Respondes solo JSON válido.' },
            { role: 'user', content: `CONCEPTO: ${termino}\nOBRA: ${ref.titulo} (${ref.autores || 's. a.'}, ${ref.anio || 's. f.'})\nResumen: ${String(resumen).slice(0, 3500)}\n\nPROYECTO DEL ESTUDIANTE (solo para saber en qué sentido se usa el concepto; no lo menciones en la definición)\nTítulo: ${proyecto?.titulo || '(sin título)'}\nProblema: ${proyecto?.problema || '(sin definir)'}\n\n- "definicion": una definición completa del concepto según el resumen, de dos o tres frases (entre 40 y 80 palabras). Primera frase: qué es, de forma precisa (a qué clase de cosa pertenece y qué lo distingue). Después: sus características, dimensiones, componentes o la forma en que se reconoce o se mide, SOLO si el resumen las menciona. Empieza en minúscula y no repitas el término al comienzo. No incluyas cifras ni resultados del estudio. Ejemplo solo de forma: «abandono de los estudios antes de obtener el título, sea de manera voluntaria o forzada. Comprende factores individuales, académicos, institucionales y socioeconómicos, y suele medirse por cohorte o por periodo». Cadena vacía si el resumen no lo define ni lo explica.\nEl ejemplo solo muestra la forma: no copies su contenido. Sin punto final.\n\nResponde exactamente con este JSON: {"definicion": "…"}` },
        ],
        temperature: 0.2,
        max_tokens: 700,
        response_format: { type: 'json_object' },
    });
    const content = r.choices?.[0]?.message?.content || '';
    const json = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
    return clean(String(json.definicion ?? '')).replace(/[.\s]+$/, '').replace(/^(?:se define como|es|son|se entiende como)\s+/i, '').replace(/([.!?]\s+)(\p{Ll})/gu, (_, p, l) => p + l.toUpperCase()).slice(0, 900);
};

const useMarcoState = () => {
    const [form, setForm] = useProjectField('marcoForm', MARCO_FORM);
    const [tituloForm] = useProjectField('tituloForm', null);
    const [idea] = useProjectField('idea', null);
    const [titulo] = useProjectField('titulo', '');
    const [pregunta] = useProjectField('pregunta', '');
    const [refs, setRefs] = useProjectField('referencias', []);
    const setters = {
        marcoAntecedentes: useProjectField('marcoAntecedentes', '')[1],
        marcoTeorico: useProjectField('marcoTeorico', '')[1],
        marcoConceptual: useProjectField('marcoConceptual', '')[1],
        marcoContextual: useProjectField('marcoContextual', '')[1],
        marcoLegal: useProjectField('marcoLegal', '')[1],
    };
    const guardados = {
        marcoAntecedentes: useProjectField('marcoAntecedentes', '')[0],
        marcoTeorico: useProjectField('marcoTeorico', '')[0],
        marcoConceptual: useProjectField('marcoConceptual', '')[0],
        marcoContextual: useProjectField('marcoContextual', '')[0],
        marcoLegal: useProjectField('marcoLegal', '')[0],
    };
    const f = { ...MARCO_FORM, ...(form || {}) };
    f.contexto = { ...MARCO_FORM.contexto, ...(f.contexto || {}) };
    ['antecedentes', 'teorias', 'conceptos', 'normas'].forEach((key) => { if (!Array.isArray(f[key]) || f[key].length === 0) f[key] = MARCO_FORM[key]; });
    const update = (patch) => setForm((prev) => ({ ...MARCO_FORM, ...(prev || {}), ...patch }));
    const i = idea || {};
    const t = tituloForm || {};
    return {
        f, update, setForm, setters, guardados, titulo, pregunta, refs: Array.isArray(refs) ? refs : [], setRefs, idea: i,
        quien: clean(t.quien || i.quien), donde: clean(t.donde || i.donde),
    };
};

// Solo enlaces web: lo que no empiece por http(s) no se guarda ni se muestra.
const enlaceSeguro = (v) => (/^https?:\/\//i.test(String(v || '').trim()) ? String(v).trim() : '');
// De dónde salió la ficha: el enlace guardado al usar la búsqueda o, en las fichas anteriores, el DOI de la
// referencia con el mismo título. El título de la fuente va tras «|» en los conceptos.
const origenDe = (item, refs) => {
    const titulo = clean(String(item.fuente || '').split('|').pop());
    if (!titulo) return null;
    const ref = (refs || []).find((r) => clean(r.titulo).toLowerCase() === titulo.toLowerCase() && r.doi);
    const enlace = enlaceSeguro(item.enlace) || (ref ? `https://doi.org/${String(ref.doi).replace(/^https?:\/\/doi\.org\//i, '')}` : '');
    return { titulo, enlace };
};

// Cómo queda la cita de una ficha frente a «Mis referencias»:
// 'ok' (hay una referencia con ese autor y año), 'ajustar' (la referencia de su fuente está, pero el autor o el año
// de la ficha no coinciden con ella) o 'falta' (no hay referencia para esa cita).
const sinTildes = (v) => clean(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
const citaDeFicha = (item, refs) => {
    const autor = autorDe(item.autor);
    const anio = clean(item.anio);
    const titulo = clean(String(item.fuente || '').split('|').pop());
    if (!autor && !anio && !titulo) return null;
    const lista = refs || [];
    const mismoAutor = (r) => sinTildes(autorCita(r)) === sinTildes(autor) && clean(r.anio) === anio;
    // Primero la referencia de su propia fuente (por título); si no, cualquiera con el mismo autor y año.
    const deFuente = titulo ? lista.find((r) => sinTildes(r.titulo) === sinTildes(titulo)) : null;
    if (deFuente) return { estado: mismoAutor(deFuente) ? 'ok' : 'ajustar', ref: deFuente, cita: `(${autorCita(deFuente)}, ${clean(deFuente.anio) || 's. f.'})` };
    const igual = autor ? lista.find(mismoAutor) : null;
    if (igual) return { estado: 'ok', ref: igual, cita: `(${autor}, ${anio || 's. f.'})` };
    return autor ? { estado: 'falta', cita: `(${autor}, ${anio || 's. f.'})` } : null;
};
// Referencia mínima a partir de lo que dice la ficha, para que la cita tenga a dónde apuntar; se completa en Referencias.
// «Pérez y Gómez» → «Pérez; Gómez». Con «et al.» solo se conoce el primer autor.
const refDesdeFicha = (item) => ({
    id: Math.random().toString(36).slice(2, 9),
    tipo: 'articulo',
    autores: clean(item.autor).replace(/\s+et al\.?$/i, '').split(/\s+y\s+|\s*;\s*|\s*&\s*/).map(clean).filter(Boolean).join('; '),
    anio: clean(item.anio),
    titulo: clean(item.titulo) || clean(String(item.fuente || '').split('|').pop()),
    revista: '', volumen: '', numero: '', paginas: '', doi: '',
});

// Lista de fichas editables (antecedentes, teorías, conceptos o normas).
// `onAgregarRef`: si se pasa, cada ficha muestra cómo está su cita frente a «Mis referencias» y deja arreglarla.
const Fichas = ({ items, vacio, max, onChange, render, agregar, refs, onAgregarRef }) => (
    <div className="mar-fichas">
        {items.map((item, index) => (
            <div className="input-group pla-part mar-ficha" key={index}>
                <div className="alc-lim-head">
                    <span className="alc-label"><mark data-part="que" data-active="true">{index + 1}</mark></span>
                    {items.length > 1 && (
                        <button type="button" className="obj-remove" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label={`Quitar el elemento ${index + 1}`}><Trash2 size={16} /></button>
                    )}
                </div>
                {render(item, (patch) => onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it))), index)}
                {onAgregarRef && (() => {
                    const c = citaDeFicha(item, refs);
                    if (!c) return null;
                    const cambiar = (patch) => onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
                    return (
                        <p className="mar-cita" data-estado={c.estado}>
                            {c.estado === 'ok' && <><CheckCircle2 size={14} aria-hidden="true" /> Cita {c.cita}: está en tus referencias.</>}
                            {c.estado === 'ajustar' && (
                                <>
                                    <AlertTriangle size={14} aria-hidden="true" /> La ficha cita «{autorDe(item.autor) || 'sin autor'}, {clean(item.anio) || 's. f.'}», pero su referencia se cita {c.cita}.
                                    <button type="button" className="ide-link" onClick={() => cambiar({ autor: autorCita(c.ref), anio: clean(c.ref.anio) })}>Ajustar la cita a la referencia</button>
                                </>
                            )}
                            {c.estado === 'falta' && (
                                <>
                                    <AlertTriangle size={14} aria-hidden="true" /> La cita {c.cita} no tiene referencia.
                                    <button type="button" className="ide-link" onClick={() => onAgregarRef(refDesdeFicha(item))}>Agregarla a mis referencias</button>
                                </>
                            )}
                        </p>
                    );
                })()}
                {origenDe(item, refs) && (
                    <p className="mar-origen">
                        <ExternalLink size={13} aria-hidden="true" /> Salió de:{' '}
                        {origenDe(item, refs).enlace
                            ? <a href={origenDe(item, refs).enlace} target="_blank" rel="noreferrer noopener">{origenDe(item, refs).titulo}</a>
                            : <span>{origenDe(item, refs).titulo}</span>}
                    </p>
                )}
            </div>
        ))}
        {items.length < max && (
            <button type="button" className="ide-btn ide-btn--ghost obj-add" onClick={() => onChange([...items, { ...vacio }])}><Plus size={15} /> {agregar}</button>
        )}
    </div>
);

const Campo = ({ id, label, value, onChange, placeholder, rows = 1, className = '' }) => (
    <label className={`mar-campo ${className}`} htmlFor={id}>
        <span>{label}</span>
        {rows > 1
            ? <EditorRico id={id} className="textarea-field" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
            : <input id={id} className="input-field" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />}
    </label>
);

const Constructor = ({ intro, onNavigate }) => {
    const { f, update, setForm, setters, idea, quien, donde, titulo, pregunta, refs, setRefs } = useMarcoState();
    const [tab, setTab] = useState('antecedentes');
    const [saved, setSaved] = useState(false);
    const partes = redactar(f);
    const texto = unir(partes);
    const problema = lower(clean(idea.problema)) || 'la inasistencia a citas médicas';
    const touch = () => setSaved(false);
    const set = (key) => (value) => { touch(); update({ [key]: value }); };

    // «Usar como…» de la búsqueda: crea la ficha con lo que se sabe del artículo y, si trae resumen, la IA la llena con él.
    // La ficha se reconoce después por `fuente` (el título del artículo), y nunca se pisa lo que el estudiante ya escribió.
    const usarArticulo = (cfg) => async (ref, resumen, enlace) => {
        const ficha = { ...cfg.base(ref), fuente: clean(ref.titulo), enlace: enlaceSeguro(enlace) };
        const actuales = f[cfg.lista];
        const libre = actuales.findIndex((x) => cfg.campos.every((k) => !clean(x[k])) && !clean(x.autor));
        set(cfg.lista)(libre >= 0 ? actuales.map((x, i) => (i === libre ? ficha : x)) : [...actuales, ficha].slice(0, cfg.max));
        if (clean(resumen).length < (cfg.tipo === 'norma' ? 20 : 80)) return 'vacia';
        try {
            let datos = await fichaDesdeResumen({ tipo: cfg.tipo, ref, resumen, proyecto: { titulo, problema: clean(idea.problema), quien, donde } });
            // En las normas los dos campos deben quedar llenos: si la IA dejó alguno vacío, se le pide una vez más.
            if (cfg.tipo === 'norma' && (!datos.establece || !datos.relacion)) {
                const otra = await fichaDesdeResumen({ tipo: cfg.tipo, ref, resumen, proyecto: { titulo, problema: clean(idea.problema), quien, donde } }).catch(() => ({}));
                datos = { establece: datos.establece || otra.establece || '', relacion: datos.relacion || otra.relacion || '' };
            }
            if (!cfg.campos.slice(0, 2).some((k) => datos[k])) return 'vacia';
            setForm((prev) => {
                const base = { ...MARCO_FORM, ...(prev || {}) };
                const lista = Array.isArray(base[cfg.lista]) ? base[cfg.lista] : [];
                const k = lista.findIndex((x) => x.fuente === ficha.fuente);
                if (k < 0) return base;
                const llena = { ...lista[k] };
                Object.entries(datos).forEach(([campo, valor]) => { if (valor && (!clean(llena[campo]) || cfg.reemplaza?.includes(campo))) llena[campo] = valor; });
                return { ...base, [cfg.lista]: lista.map((x, i) => (i === k ? llena : x)) };
            });
            touch();
            return 'llena';
        } catch {
            return 'vacia'; // sin IA: queda la ficha con lo que se sabía del artículo
        }
    };
    // Pone una ficha nueva en la primera que esté libre (o al final). Parte siempre de lo último guardado:
    // así dos «Usar» seguidos no se pisan.
    const ponerFicha = (lista, ficha, max, estaLibre) => {
        touch();
        setForm((prev) => {
            const base = { ...MARCO_FORM, ...(prev || {}) };
            const actuales = Array.isArray(base[lista]) && base[lista].length ? base[lista] : MARCO_FORM[lista];
            if (actuales.some((x) => x.fuente === ficha.fuente)) return base;
            const libre = actuales.findIndex(estaLibre);
            return { ...base, [lista]: libre >= 0 ? actuales.map((x, i) => (i === libre ? ficha : x)) : [...actuales, ficha].slice(0, max) };
        });
    };
    // Citas del apartado frente a «Mis referencias»: cuántas no coinciden, y arreglarlas todas de una vez.
    const LISTA_CITAS = { antecedentes: 'antecedentes', teorico: 'teorias', conceptual: 'conceptos' };
    const agregarRef = (ref) => setRefs((prev) => [...(Array.isArray(prev) ? prev : []), ref]);
    const citasTab = LISTA_CITAS[tab] ? f[LISTA_CITAS[tab]].map((x) => citaDeFicha(x, refs)) : [];
    const pendientes = citasTab.filter((c) => c && c.estado !== 'ok').length;
    const arreglarCitas = () => {
        const lista = LISTA_CITAS[tab];
        const nuevas = [];
        const fichas = f[lista].map((x) => {
            const c = citaDeFicha(x, [...refs, ...nuevas]);
            if (c?.estado === 'ajustar') return { ...x, autor: autorCita(c.ref), anio: clean(c.ref.anio) };
            if (c?.estado === 'falta') nuevas.push(refDesdeFicha(x));
            return x;
        });
        if (nuevas.length) setRefs((prev) => [...(Array.isArray(prev) ? prev : []), ...nuevas]);
        set(lista)(fichas);
    };
    // «Usar esta obra» de «Sugerir teorías»: el nombre viene de la propuesta; el autor y el año, de la obra encontrada.
    const usarTeoria = async ({ nombre, ref, resumen, prestado, enlace }) => {
        const fuente = clean(ref.titulo);
        const ficha = { ...VACIO.teoria, nombre: clean(nombre), autor: autorCita(ref), anio: ref.anio, fuente, enlace: enlaceSeguro(enlace) };
        ponerFicha('teorias', ficha, 5, (x) => !clean(x.nombre) && !clean(x.postulado) && !clean(x.autor));
        try {
            const datos = await teoriaDesdeObra({ nombre, ref, resumen, proyecto: { titulo, problema: clean(idea.problema), quien, donde } });
            if (!datos.postulado && !datos.relacion) return 'vacia';
            setForm((prev) => {
                const base = { ...MARCO_FORM, ...(prev || {}) };
                const lista = Array.isArray(base.teorias) ? base.teorias : [];
                const k = lista.findIndex((x) => x.fuente === fuente);
                if (k < 0) return base;
                const llena = { ...lista[k] };
                Object.entries(datos).forEach(([campo, valor]) => { if (valor && !clean(llena[campo])) llena[campo] = valor; });
                return { ...base, teorias: lista.map((x, i) => (i === k ? llena : x)) };
            });
            touch();
            if (!datos.postulado) return 'vacia';
            return clean(resumen).length < 80 ? 'ia' : prestado ? 'prestada' : 'llena';
        } catch {
            return 'vacia'; // sin IA: queda la ficha con el nombre, el autor y el año
        }
    };
    // «Usar la definición de esta obra» de «Sugerir conceptos»: el término viene de la propuesta; la definición, del resumen.
    const usarConcepto = async ({ nombre, ref, resumen, enlace }) => {
        const fuente = `${clean(nombre)}|${clean(ref.titulo)}`;
        const ficha = { ...VACIO.concepto, termino: clean(nombre), autor: autorCita(ref), anio: ref.anio, fuente, enlace: enlaceSeguro(enlace) };
        ponerFicha('conceptos', ficha, MAX_CONCEPTOS, (x) => !clean(x.termino) && !clean(x.definicion) && !clean(x.autor));
        if (clean(resumen).length < 80) return 'vacia';
        try {
            const definicion = await conceptoDesdeObra({ termino: nombre, ref, resumen, proyecto: { titulo, problema: clean(idea.problema) } });
            if (!definicion) return 'vacia';
            setForm((prev) => {
                const base = { ...MARCO_FORM, ...(prev || {}) };
                const lista = Array.isArray(base.conceptos) ? base.conceptos : [];
                return { ...base, conceptos: lista.map((x) => (x.fuente === fuente && !clean(x.definicion) ? { ...x, definicion } : x)) };
            });
            touch();
            return 'llena';
        } catch {
            return 'vacia';
        }
    };
    const save = () => {
        Object.entries(partes).forEach(([field, value]) => { if (value.trim()) setters[field](value); });
        setSaved(true);
    };
    // Guardado automático: lo redactado pasa a Mi proyecto sin tener que tocar «Guardar».
    useAutoGuardar(texto, save);
    const cuenta = {
        antecedentes: f.antecedentes.filter((a) => clean(a.autor) && clean(a.hallazgo)).length,
        teorico: f.teorias.filter((t) => clean(t.nombre) && clean(t.postulado)).length,
        conceptual: f.conceptos.filter((c) => clean(c.termino) && clean(c.definicion)).length,
        contextual: clean(partes.marcoContextual) ? 1 : 0,
        legal: f.normas.filter((n) => clean(n.establece)).length,
    };

    return (
        <div className="pla-builder-wrap">
            <header className="pla-builder-head">
                <div>{intro}</div>
                <div className="pla-status">
                    <p className="obj-count"><b>{countWords(texto)} palabras</b> · {APARTADOS.filter((a) => cuenta[a.key] > 0).length} de 5 apartados</p>
                    <button type="button" className="ide-btn ide-btn--primary" disabled={!texto} onClick={save}>
                        <CheckCircle2 size={17} /> Guardar mi marco referencial
                    </button>
                    {saved && <p className="ide-feedback ide-feedback--ok" role="status"><CheckCircle2 size={16} /><span>Guardado. Ya aparece en Mi proyecto con sus cinco subtítulos.</span></p>}
                </div>
            </header>

            <div className="pla-builder">
                <div className="obj-form">
                    <div className="mar-tabs" role="tablist" aria-label="Apartados del marco referencial">
                        {APARTADOS.map((a) => {
                            const Icon = a.icon;
                            return (
                                <button key={a.key} type="button" role="tab" aria-selected={tab === a.key} onClick={() => setTab(a.key)}>
                                    <Icon size={15} aria-hidden="true" /> {a.label}
                                    <span className="mar-tab-count" data-ok={cuenta[a.key] > 0 || undefined}>{cuenta[a.key]}</span>
                                </button>
                            );
                        })}
                    </div>
                    <p className="ide-field-hint mar-pregunta">{APARTADOS.find((a) => a.key === tab).pregunta}</p>
                    {(tab === 'antecedentes' || tab === 'teorico') && (
                        <Integrado
                            key={`integrado-${tab}`}
                            apartado={tab}
                            f={f}
                            valor={String(f.integrado?.[tab] || '')}
                            onChange={(v) => { touch(); update({ integrado: { ...(f.integrado || {}), [tab]: v } }); }}
                            proyecto={{ titulo, pregunta: clean(pregunta), problema: clean(idea.problema) }}
                        />
                    )}
                    {['antecedentes', 'teorico', 'conceptual'].includes(tab) && <SinFuente apartado={tab} f={f} texto={partes[APARTADOS.find((a) => a.key === tab).field]} />}

                    {/* Búsqueda en bases de datos: en antecedentes, marco teórico y marco conceptual. La ficha se llena con el resumen. */}
                    {FICHA_DE[tab]?.buscar && (
                        <BuscarAntecedentes
                            key={tab}
                            sugerencia={tab === 'teorico' ? `teoría ${problema}` : problema}
                            titulo={FICHA_DE[tab].buscar}
                            usarComo={FICHA_DE[tab].nombre}
                            onUsar={usarArticulo(FICHA_DE[tab])}
                        />
                    )}
                    {tab === 'teorico' && (
                        <SugerirTeorias
                            key="teorias"
                            proyecto={{ titulo, problema: clean(idea.problema), pregunta: clean(pregunta), quien, donde }}
                            yaTiene={f.teorias.map((t) => clean(t.nombre)).filter(Boolean)}
                            onUsar={usarTeoria}
                        />
                    )}
                    {tab === 'conceptual' && (
                        <SugerirTeorias
                            key="conceptos"
                            tipo="concepto"
                            proyecto={{ titulo, problema: clean(idea.problema), pregunta: clean(pregunta), quien, donde }}
                            yaTiene={f.conceptos.map((c) => clean(c.termino)).filter(Boolean)}
                            cupo={MAX_CONCEPTOS - f.conceptos.filter((c) => clean(c.termino) || clean(c.definicion) || clean(c.autor)).length}
                            onUsar={usarConcepto}
                        />
                    )}
                    {LISTA_CITAS[tab] && citasTab.some(Boolean) && (
                        <p className="mar-citas-resumen" data-ok={pendientes === 0 || undefined}>
                            {pendientes === 0
                                ? <><CheckCircle2 size={15} aria-hidden="true" /> Todas las citas de este apartado están en tus referencias.</>
                                : (
                                    <>
                                        <AlertTriangle size={15} aria-hidden="true" /> {pendientes === 1 ? 'Una cita de este apartado no coincide' : `${pendientes} citas de este apartado no coinciden`} con tus referencias.
                                        <button type="button" className="ide-btn ide-btn--ghost" onClick={arreglarCitas}>Ajustarlas y ponerlas en referencias</button>
                                    </>
                                )}
                        </p>
                    )}
                    {tab === 'antecedentes' && (
                        <Fichas
                            refs={refs}
                            onAgregarRef={agregarRef}
                            items={f.antecedentes}
                            vacio={VACIO.antecedente}
                            max={10}
                            agregar="Agregar antecedente (lo usual es entre 5 y 10)"
                            onChange={set('antecedentes')}
                            render={(a, change, i) => (
                                <div className="mar-grid">
                                    <Campo id={`ant-autor-${i}`} label="Autor(es)" value={a.autor} onChange={(v) => change({ autor: v })} placeholder="Ej: Pérez y Gómez" />
                                    <Campo id={`ant-anio-${i}`} label="Año" value={a.anio} onChange={(v) => change({ anio: v })} placeholder={`Ej: ${ANIO_ACTUAL - 3}`} />
                                    <label className="mar-campo" htmlFor={`ant-ambito-${i}`}>
                                        <span>Ámbito</span>
                                        <select id={`ant-ambito-${i}`} className="input-field" value={a.ambito} onChange={(e) => change({ ambito: e.target.value })}>
                                            {AMBITOS.map((x) => <option key={x}>{x}</option>)}
                                        </select>
                                    </label>
                                    <Campo id={`ant-lugar-${i}`} label="Lugar" value={a.lugar} onChange={(v) => change({ lugar: v })} placeholder="Ej: un hospital de Bogotá" />
                                    <Campo className="mar-wide" id={`ant-titulo-${i}`} label="Título del estudio" value={a.titulo} onChange={(v) => change({ titulo: v })} placeholder={`Ej: Factores asociados a ${problema}`} />
                                    <Campo className="mar-wide" id={`ant-obj-${i}`} label="Qué buscó y cómo" value={a.objetivo} onChange={(v) => change({ objetivo: v })} rows={2} placeholder="Ej: identificar las causas de la inasistencia mediante una encuesta a 1.200 pacientes" />
                                    <Campo className="mar-wide" id={`ant-hal-${i}`} label="Qué encontró" value={a.hallazgo} onChange={(v) => change({ hallazgo: v })} rows={2} placeholder="Ej: el olvido explicó el 41 % de las citas perdidas" />
                                    <Campo className="mar-wide" id={`ant-rel-${i}`} label="Cómo se relaciona con tu estudio" value={a.relacion} onChange={(v) => change({ relacion: v })} rows={2} placeholder="Ej: aporta una de las variables que se medirán y el instrumento que se adaptará" />
                                </div>
                            )}
                        />
                    )}

                    {tab === 'teorico' && (
                        <Fichas
                            refs={refs}
                            onAgregarRef={agregarRef}
                            items={f.teorias}
                            vacio={VACIO.teoria}
                            max={5}
                            agregar="Agregar otra teoría"
                            onChange={set('teorias')}
                            render={(t, change, i) => (
                                <div className="mar-grid">
                                    <Campo className="mar-wide" id={`teo-nombre-${i}`} label="Nombre de la teoría o modelo" value={t.nombre} onChange={(v) => change({ nombre: v })} placeholder="Ej: El modelo de creencias en salud" />
                                    <Campo id={`teo-autor-${i}`} label="Autor(es)" value={t.autor} onChange={(v) => change({ autor: v })} placeholder="Ej: Rosenstock" />
                                    <Campo id={`teo-anio-${i}`} label="Año" value={t.anio} onChange={(v) => change({ anio: v })} placeholder="Ej: 1974" />
                                    <Campo className="mar-wide" id={`teo-post-${i}`} label="Qué plantea" value={t.postulado} onChange={(v) => change({ postulado: v })} rows={3} placeholder="Ej: las personas actúan para cuidar su salud según la amenaza que perciben, los beneficios y las barreras de la acción" />
                                    <Campo className="mar-wide" id={`teo-rel-${i}`} label="Por qué sustenta tu estudio" value={t.relacion} onChange={(v) => change({ relacion: v })} rows={2} placeholder={`Ej: permite explicar ${problema} a partir de las barreras que perciben los pacientes`} />
                                </div>
                            )}
                        />
                    )}

                    {tab === 'conceptual' && (
                        <Fichas
                            refs={refs}
                            onAgregarRef={agregarRef}
                            items={f.conceptos}
                            vacio={VACIO.concepto}
                            max={MAX_CONCEPTOS}
                            agregar={`Agregar concepto (entre tres y ${MAX_CONCEPTOS}: solo los fundamentales)`}
                            onChange={set('conceptos')}
                            render={(c, change, i) => (
                                <div className="mar-grid">
                                    <Campo className="mar-wide" id={`con-term-${i}`} label="Término" value={c.termino} onChange={(v) => change({ termino: v })} placeholder={`Ej: ${capital(problema)}`} />
                                    <Campo className="mar-wide" id={`con-def-${i}`} label="Definición" value={c.definicion} onChange={(v) => change({ definicion: v })} rows={4} placeholder="Ej: ausencia del paciente a una cita programada sin cancelación previa" />
                                    <Campo id={`con-autor-${i}`} label="Autor" value={c.autor} onChange={(v) => change({ autor: v })} placeholder="Ej: Pérez" />
                                    <Campo id={`con-anio-${i}`} label="Año" value={c.anio} onChange={(v) => change({ anio: v })} placeholder={`Ej: ${ANIO_ACTUAL - 4}`} />
                                </div>
                            )}
                        />
                    )}

                    {tab === 'contextual' && (
                        <div className="input-group pla-part mar-grid">
                            <Campo className="mar-wide" id="ctx-lugar" label="Dónde" value={f.contexto.lugar} onChange={(v) => set('contexto')({ ...f.contexto, lugar: v })} placeholder={`Ej: ${donde || 'un hospital de Sincelejo, Sucre'}`} />
                            <Campo className="mar-wide" id="ctx-car" label="Características del lugar" value={f.contexto.caracteristicas} onChange={(v) => set('contexto')({ ...f.contexto, caracteristicas: v })} rows={3} placeholder="Ej: Sincelejo es la capital de Sucre, con cerca de 300.000 habitantes; su red pública de salud…" />
                            <Campo className="mar-wide" id="ctx-inst" label="La institución" value={f.contexto.institucion} onChange={(v) => set('contexto')({ ...f.contexto, institucion: v })} rows={3} placeholder="Ej: El hospital es de segundo nivel, atiende unas 4.000 consultas externas al mes…" />
                            <Campo className="mar-wide" id="ctx-pob" label="La población" value={f.contexto.poblacion} onChange={(v) => set('contexto')({ ...f.contexto, poblacion: v })} rows={3} placeholder={`Ej: ${quien ? `${capital(quien)} son` : 'Los pacientes son'} principalmente adultos del régimen subsidiado…`} />
                        </div>
                    )}

                    {tab === 'legal' && (
                        <BuscarNormas
                            sugerencia={problema}
                            // La norma se trata como un «artículo»: su cita es el título y su extracto, el resumen.
                            onUsar={(norma) => usarArticulo(FICHA_DE.legal)({ titulo: norma.cita, cita: norma.cita, anio: norma.anio, autores: norma.fuente }, norma.extracto, norma.enlace)}
                        />
                    )}
                    {tab === 'legal' && (
                        <Fichas
                            refs={refs}
                            items={f.normas}
                            vacio={VACIO.norma}
                            max={10}
                            agregar="Agregar norma (se ordenan solas por jerarquía)"
                            onChange={set('normas')}
                            render={(n, change, i) => (
                                <div className="mar-grid">
                                    <label className="mar-campo" htmlFor={`nor-tipo-${i}`}>
                                        <span>Tipo</span>
                                        <select id={`nor-tipo-${i}`} className="input-field" value={n.tipo} onChange={(e) => change({ tipo: e.target.value })}>
                                            {TIPOS_NORMA.map((x) => <option key={x}>{x}</option>)}
                                        </select>
                                    </label>
                                    <Campo id={`nor-num-${i}`} label={n.tipo === 'Constitución Política' ? 'Artículo' : n.tipo === 'Norma institucional' ? 'Nombre' : 'Número'} value={n.numero} onChange={(v) => change({ numero: v })} placeholder={n.tipo === 'Constitución Política' ? 'Ej: 49' : n.tipo === 'Norma institucional' ? 'Ej: reglamento de citas del hospital' : 'Ej: 1751'} />
                                    {n.tipo !== 'Constitución Política' && <Campo id={`nor-anio-${i}`} label="Año" value={n.anio} onChange={(v) => change({ anio: v })} placeholder="Ej: 2015" />}
                                    <Campo className="mar-wide" id={`nor-est-${i}`} label="Qué establece" value={n.establece} onChange={(v) => change({ establece: v })} rows={2} placeholder="Ej: la salud como un derecho fundamental autónomo" />
                                    <Campo className="mar-wide" id={`nor-rel-${i}`} label="Por qué se relaciona con tu estudio" value={n.relacion} onChange={(v) => change({ relacion: v })} rows={2} placeholder="Ej: obliga a las instituciones a garantizar el acceso oportuno a la consulta" />
                                </div>
                            )}
                        />
                    )}
                    {onNavigate && (
                        <button type="button" className="ide-link" onClick={() => onNavigate('referencias')}>Registra tus fuentes en Referencias (también por DOI) <ArrowRight size={13} /></button>
                    )}
                </div>

                <aside className="pla-side" aria-label="Tu marco referencial">
                    <p className="ide-synth-label">Así queda tu marco referencial</p>
                    <div className="pla-preview mar-preview" aria-live="polite">
                        {texto
                            ? APARTADOS.map((a) => (clean(partes[a.field]) ? (
                                <section key={a.key} data-active={tab === a.key}>
                                    <h4>{a.label}</h4>
                                    {partes[a.field].split('\n').filter(Boolean).map((line) => <p key={line}>{line.replace(/\*\*/g, '').replace(/^- /, '• ')}</p>)}
                                </section>
                            ) : null))
                            : <span className="tit-empty">Completa las fichas de cada apartado y aquí verás el texto redactado con sus cinco subtítulos.</span>}
                    </div>
                </aside>
            </div>
        </div>
    );
};

/* ---------- Revisión ---------- */

const CRITERIOS = [
    { label: 'Completo', text: 'Antecedentes, Marco Teórico, Conceptual, Contextual y Legal.' },
    { label: 'Actual', text: 'Antecedentes de los últimos diez años.' },
    { label: 'Relacionado', text: 'Cada antecedente y teoría dice para qué sirve en tu estudio.' },
    { label: 'Citado', text: 'Cada idea con (Autor, año) en APA 7.' },
    { label: 'Concreto', text: 'El contexto describe tu lugar y tu población.' },
];

const Revision = ({ intro }) => {
    const { guardados, f, quien, donde } = useMarcoState();
    const guardado = unir(guardados);
    const own = guardado || unir(redactar(f));
    const [text, setText] = useState(own);
    const target = text.trim();
    const isOwn = target === own;
    const checks = checkMarco(target, isOwn ? { quien, donde } : {});
    const passed = checks.filter((item) => item.ok).length;
    return (
        <>
            <div className="ide-synth-left">
                {intro}
                <ul className="tit-criteria">
                    {CRITERIOS.map((item) => <li key={item.label}><b>{item.label}</b> {item.text}</li>)}
                </ul>
                <label htmlFor="mar-revisar" className="ide-synth-label">Marco referencial a revisar</label>
                <textarea
                    id="mar-revisar"
                    className="textarea-field tit-review-input"
                    rows={8}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder={'Antecedentes\n…\n\nMarco Teórico\n…\n\nMarco Conceptual\n…\n\nMarco Contextual\n…\n\nMarco Legal\n…'}
                />
                {!isOwn && own && <button type="button" className="ide-link" onClick={() => setText(own)}>Volver a mi marco</button>}
            </div>
            <div className="ide-panel">
                <h3>{target ? `Cumple ${passed} de ${checks.length} criterios` : 'Criterios que se revisan'}</h3>
                <ul className="tit-checks">
                    {checks.map((item) => (
                        <li key={item.id} data-ok={target ? item.ok : undefined}>
                            {!target ? <Target size={18} aria-hidden="true" /> : item.ok ? <CheckCircle2 size={18} aria-hidden="true" /> : <AlertTriangle size={18} aria-hidden="true" />}
                            <span><b>{item.label}</b>{target && !item.ok && item.detail}</span>
                        </li>
                    ))}
                </ul>
                <p className="ide-hint">
                    {isOwn ? 'Revisa la forma de tu marco guardado.' : 'Revisando un texto distinto al tuyo: se omite el criterio de tu lugar y tu población.'} Escribe cada subtítulo en una línea aparte. Que las fuentes existan y sean confiables lo valida tu asesor.
                </p>
            </div>
        </>
    );
};

/* ---------- Clase ---------- */

const MarcoReferencial = ({ onNavigate }) => {
    const [titulo] = useProjectField('titulo', '');
    const [ant] = useProjectField('marcoAntecedentes', '');
    const [teo] = useProjectField('marcoTeorico', '');
    const [con] = useProjectField('marcoConceptual', '');
    const [ctx] = useProjectField('marcoContextual', '');
    const [leg] = useProjectField('marcoLegal', '');
    const hechos = [ant, teo, con, ctx, leg].filter((x) => String(x || '').trim()).length;

    const renderSlide = ({ slide, heading, goToSection, sectionMinutes, totalMinutes }) => ({
        portada: (
            <>
                <div>
                    {heading}
                    <p>El marco referencial reúne lo que ya se sabe sobre tu tema y lo que rodea a tu estudio: investigaciones previas, teorías, conceptos, el lugar y las normas. Es la base sobre la que se apoya todo lo demás.</p>
                    <p><strong>Al terminar esta clase podrás:</strong></p>
                    <ul className="ide-bullets">
                        <li>Distinguir los cinco apartados del marco referencial.</li>
                        <li>Buscar, leer y presentar antecedentes.</li>
                        <li>Elegir teorías, definir conceptos y describir el contexto.</li>
                        <li>Organizar el marco legal por jerarquía.</li>
                        <li>Citar en APA 7 y construir el tuyo.</li>
                    </ul>
                    {clean(titulo) && <div className="tit-from-idea"><span>Tu título</span><p>{titulo}</p></div>}
                </div>
                <div className="ide-panel">
                    <h3>Plan de la clase · {totalMinutes} minutos</h3>
                    <ol className="ide-agenda">
                        {SECTIONS.map((section) => (
                            <li key={section.id}>
                                <button type="button" onClick={() => goToSection(section.id)}>
                                    <span>{section.label}</span>
                                    <small>{SLIDES.filter((item) => item.section === section.id).map((item) => item.title).join(' · ')}</small>
                                    <b>{sectionMinutes(section.id)} min</b>
                                </button>
                            </li>
                        ))}
                    </ol>
                </div>
            </>
        ),
        construye: (
            <Constructor
                onNavigate={onNavigate}
                intro={(
                    <>
                        {heading}
                        <p>Elige un apartado y llena una ficha por cada fuente: el texto se redacta solo, con sus citas, y queda bajo su subtítulo.</p>
                    </>
                )}
            />
        ),
        revision: (
            <Revision
                intro={(
                    <>
                        {heading}
                        <p>Revisa tu marco antes de llevarlo a tu asesor. También puedes pegar el de otro trabajo, con sus subtítulos, para analizarlo.</p>
                    </>
                )}
            />
        ),
    })[slide.id] || (
        <Generica
            slide={slide}
            heading={heading}
            onNavigate={onNavigate}
            aside={slide.status ? (
                <div className="ide-panel">
                    <h3>Siguiente paso</h3>
                    <div className="tit-saved"><span>Tu marco hoy</span><p>{hechos} de 5 apartados guardados</p></div>
                    <p>Ten a mano las fuentes que encontraste: en la construcción llenarás una ficha por cada una.</p>
                </div>
            ) : null}
        />
    );

    return (
        <SlideDeck
            sections={SECTIONS}
            slides={SLIDES}
            storageKey={SLIDE_KEY}
            label="Marco referencial"
            teoria={TEORIA}
            renderSlide={renderSlide}
            finish={onNavigate ? { label: 'Definir la metodología', onClick: () => onNavigate('metodologia') } : null}
        />
    );
};

export default MarcoReferencial;
