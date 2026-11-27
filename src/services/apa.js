/*
 * Referencias bibliográficas en APA 7 (en español).
 * - Formatea la referencia completa según el tipo de fuente (con *cursivas*).
 * - Genera la cita en el texto (parentética y narrativa).
 * - Detecta las citas escritas en el proyecto y las cruza con la lista de referencias.
 */

export const TIPOS_REF = [
    { id: 'articulo', label: 'Artículo de revista', campos: ['autores', 'anio', 'titulo', 'revista', 'volumen', 'numero', 'paginas', 'doi'], requeridos: ['autores', 'anio', 'titulo', 'revista'] },
    { id: 'libro', label: 'Libro', campos: ['autores', 'anio', 'titulo', 'edicion', 'editorial', 'doi'], requeridos: ['autores', 'anio', 'titulo', 'editorial'] },
    { id: 'capitulo', label: 'Capítulo de libro', campos: ['autores', 'anio', 'titulo', 'editores', 'libro', 'paginas', 'editorial', 'doi'], requeridos: ['autores', 'anio', 'titulo', 'libro', 'editorial'] },
    { id: 'tesis', label: 'Tesis o trabajo de grado', campos: ['autores', 'anio', 'titulo', 'grado', 'institucion', 'repositorio', 'url'], requeridos: ['autores', 'anio', 'titulo', 'institucion'] },
    { id: 'informe', label: 'Informe o documento institucional', campos: ['autores', 'anio', 'titulo', 'numero', 'editorial', 'url'], requeridos: ['autores', 'anio', 'titulo'] },
    { id: 'web', label: 'Página web', campos: ['autores', 'anio', 'fecha', 'titulo', 'sitio', 'url'], requeridos: ['autores', 'titulo', 'url'] },
    { id: 'ley', label: 'Ley o norma', campos: ['titulo', 'anio', 'descripcion', 'fecha', 'fuente', 'url'], requeridos: ['titulo', 'anio'] },
    { id: 'conferencia', label: 'Ponencia o conferencia', campos: ['autores', 'anio', 'fecha', 'titulo', 'tipoPonencia', 'evento', 'lugar', 'url'], requeridos: ['autores', 'anio', 'titulo', 'evento'] },
];

export const CAMPOS = {
    autores: { label: 'Autores', placeholder: 'Pérez, A. M.; Gómez, L.  ·  o una institución: Ministerio de Salud', ayuda: 'Apellido, Iniciales; separa los autores con punto y coma.' },
    anio: { label: 'Año', placeholder: '2022' },
    titulo: { label: 'Título', placeholder: 'Factores asociados a la inasistencia a citas médicas' },
    revista: { label: 'Revista', placeholder: 'Revista de Salud Pública' },
    volumen: { label: 'Volumen', placeholder: '24' },
    numero: { label: 'Número', placeholder: '3' },
    paginas: { label: 'Páginas', placeholder: '10-25' },
    doi: { label: 'DOI', placeholder: '10.1234/abcd.2022.001' },
    url: { label: 'URL', placeholder: 'https://…' },
    edicion: { label: 'Edición', placeholder: '6.ª ed.' },
    editorial: { label: 'Editorial u organización', placeholder: 'McGraw-Hill' },
    editores: { label: 'Editores del libro', placeholder: 'Ruiz, C.; Mora, P.' },
    libro: { label: 'Título del libro', placeholder: 'Salud pública en Colombia' },
    grado: { label: 'Tipo de trabajo', placeholder: 'Tesis de maestría' },
    institucion: { label: 'Universidad', placeholder: 'Universidad de Sucre' },
    repositorio: { label: 'Repositorio', placeholder: 'Repositorio institucional' },
    fecha: { label: 'Día y mes', placeholder: '16 de febrero' },
    sitio: { label: 'Nombre del sitio', placeholder: 'Organización Mundial de la Salud' },
    descripcion: { label: 'Descripción (epígrafe)', placeholder: 'Por medio de la cual se regula el derecho fundamental a la salud' },
    fuente: { label: 'Publicación oficial', placeholder: 'Diario Oficial No. 49.427' },
    tipoPonencia: { label: 'Tipo de contribución', placeholder: 'Ponencia' },
    evento: { label: 'Evento', placeholder: 'Congreso Colombiano de Salud Pública' },
    lugar: { label: 'Lugar', placeholder: 'Bogotá, Colombia' },
};

const t = (v) => String(v ?? '').trim();
const sinPunto = (v) => t(v).replace(/[.\s]+$/, '');
const plain = (v) => t(v).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/* ---------- Autores ---------- */

// «Pérez, A. M.; Gómez, L.» → [{ apellido, iniciales }]. Una institución queda como { apellido: 'Ministerio de Salud', institucion: true }.
export const leerAutores = (texto) => t(texto).split(/\s*;\s*|\n+/).map((raw) => {
    const a = t(raw);
    if (!a) return null;
    if (!a.includes(',')) {
        const palabras = a.split(/\s+/);
        // «Ana María Pérez» (2–4 palabras, sin palabras de institución) → Pérez, A. M.
        const pareceInstitucion = palabras.length > 4 || /\b(de|del|la|el|para|y|ministerio|universidad|organización|organizacion|instituto|secretaría|congreso|departamento|banco|asociación|fundación|oms|ops|dane|unesco|cepal)\b/i.test(a);
        if (pareceInstitucion || palabras.length === 1) return { apellido: a, iniciales: '', institucion: palabras.length > 1 || /^[A-ZÁÉÍÓÚÑ]{2,}$/.test(a) };
        const apellido = palabras[palabras.length - 1];
        return { apellido, iniciales: palabras.slice(0, -1).map((p) => `${p[0].toUpperCase()}.`).join(' ') };
    }
    const [apellido, resto = ''] = a.split(/,(.*)/s).map(t);
    const iniciales = resto.split(/[\s.]+/).filter(Boolean).map((p) => `${p[0].toUpperCase()}.`).join(' ');
    return { apellido, iniciales };
}).filter(Boolean);

const nombreRef = (a) => (a.iniciales ? `${a.apellido}, ${a.iniciales}` : a.apellido);

// Lista de autores para la referencia: «Pérez, A., Gómez, L. y Ruiz, C.» (hasta 20; con 21 o más, 19 … último).
export const autoresReferencia = (texto) => {
    const as = leerAutores(texto);
    if (as.length === 0) return '';
    const n = as.map(nombreRef);
    if (n.length === 1) return n[0];
    if (n.length === 2) return `${n[0]} y ${n[1]}`;
    if (n.length <= 20) return `${n.slice(0, -1).join(', ')} y ${n[n.length - 1]}`;
    return `${n.slice(0, 19).join(', ')}, … ${n[n.length - 1]}`;
};

// Autor para la cita: «Pérez», «Pérez y Gómez», «Pérez et al.».
export const autorCita = (ref) => {
    if (ref.tipo === 'ley') return sinPunto(ref.titulo).replace(/\sde\s(19|20)\d{2}$/i, '');
    const as = leerAutores(ref.autores);
    if (as.length === 0) return sinPunto(ref.titulo).split(/\s+/).slice(0, 4).join(' ') || 'Autor';
    if (as.length === 1) return as[0].apellido;
    if (as.length === 2) return `${as[0].apellido} y ${as[1].apellido}`;
    return `${as[0].apellido} et al.`;
};

const anioDe = (ref) => t(ref.anio) || 's. f.';

export const citaParentetica = (ref) => `(${autorCita(ref)}, ${anioDe(ref)})`;
export const citaNarrativa = (ref) => `${autorCita(ref)} (${anioDe(ref)})`;

/* ---------- Referencia completa ---------- */

const doiUrl = (ref) => {
    const d = t(ref.doi).replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '');
    if (d) return `https://doi.org/${d}`;
    return t(ref.url);
};
const fin = (partes) => partes.filter(Boolean).join(' ').replace(/\s+/g, ' ').replace(/\.\./g, '.').trim();
const punto = (v) => (t(v) ? `${sinPunto(v)}.` : '');
const editoresRef = (texto) => {
    const as = leerAutores(texto);
    if (as.length === 0) return '';
    const n = as.map((a) => (a.iniciales ? `${a.iniciales} ${a.apellido}` : a.apellido));
    const lista = n.length <= 2 ? n.join(' y ') : `${n.slice(0, -1).join(', ')} y ${n[n.length - 1]}`;
    return `${lista} (${as.length > 1 ? 'Eds.' : 'Ed.'})`;
};

// Devuelve la referencia en APA 7 con *cursivas* marcadas entre asteriscos.
export const referenciaAPA = (ref) => {
    const autores = autoresReferencia(ref.autores);
    const anio = anioDe(ref);
    const fecha = t(ref.fecha) ? `${anio}, ${t(ref.fecha)}` : anio;
    const titulo = sinPunto(ref.titulo);
    const link = doiUrl(ref);
    const quien = autores ? `${sinPunto(autores)}.` : '';
    switch (ref.tipo) {
        case 'articulo': {
            const vol = t(ref.volumen) ? `, *${t(ref.volumen)}*${t(ref.numero) ? `(${t(ref.numero)})` : ''}` : (t(ref.numero) ? `, (${t(ref.numero)})` : '');
            const pag = t(ref.paginas) ? `, ${t(ref.paginas).replace(/\s*-\s*/, '–')}` : '';
            return fin([quien, `(${anio}).`, punto(titulo), t(ref.revista) ? `*${sinPunto(ref.revista)}*${vol}${pag}.` : '', link]);
        }
        case 'libro':
            return fin([quien, `(${anio}).`, `*${titulo}*${t(ref.edicion) ? ` (${sinPunto(ref.edicion)}.)` : ''}.`, punto(ref.editorial), link]);
        case 'capitulo': {
            const eds = editoresRef(ref.editores);
            const pag = t(ref.paginas) ? ` (pp. ${t(ref.paginas).replace(/\s*-\s*/, '–')})` : '';
            return fin([quien, `(${anio}).`, punto(titulo), `En ${eds ? `${eds}, ` : ''}*${sinPunto(ref.libro)}*${pag}.`, punto(ref.editorial), link]);
        }
        case 'tesis':
            return fin([quien, `(${anio}).`, `*${titulo}*${t(ref.grado) || t(ref.institucion) ? ` [${[sinPunto(ref.grado) || 'Tesis', sinPunto(ref.institucion)].filter(Boolean).join(', ')}]` : ''}.`, punto(ref.repositorio), link]);
        case 'informe': {
            const mismoEditor = plain(ref.editorial) === plain(ref.autores);
            return fin([quien, `(${anio}).`, `*${titulo}*${t(ref.numero) ? ` (${sinPunto(ref.numero)})` : ''}.`, mismoEditor ? '' : punto(ref.editorial), link]);
        }
        case 'web': {
            const mismoSitio = plain(ref.sitio) === plain(ref.autores);
            return fin([quien || `*${titulo}*.`, `(${fecha}).`, quien ? `*${titulo}*.` : '', mismoSitio ? '' : punto(ref.sitio), link]);
        }
        case 'ley':
            return fin([punto(titulo), punto(ref.descripcion), t(ref.fecha) ? `${sinPunto(ref.fecha)}${/\d{4}/.test(ref.fecha) ? '' : ` de ${anio}`}.` : '', punto(ref.fuente), link]);
        case 'conferencia':
            return fin([quien, `(${fecha}).`, `*${titulo}*${t(ref.tipoPonencia) ? ` [${sinPunto(ref.tipoPonencia)}]` : ''}.`, [sinPunto(ref.evento), sinPunto(ref.lugar)].filter(Boolean).join(', ') ? `${[sinPunto(ref.evento), sinPunto(ref.lugar)].filter(Boolean).join(', ')}.` : '', link]);
        default:
            return fin([quien, `(${anio}).`, punto(titulo), link]);
    }
};

export const faltantes = (ref) => {
    const tipo = TIPOS_REF.find((x) => x.id === ref.tipo) || TIPOS_REF[0];
    return tipo.requeridos.filter((campo) => !t(ref[campo])).map((campo) => CAMPOS[campo].label.toLowerCase());
};

// Orden alfabético por el primer elemento de la referencia (sin tildes ni mayúsculas).
export const ordenarReferencias = (refs) => [...(refs || [])].sort((a, b) => plain(referenciaAPA(a).replace(/\*/g, '')).localeCompare(plain(referenciaAPA(b).replace(/\*/g, '')), 'es'));

/* ---------- Clave para cruzar citas y referencias ---------- */

// Partículas de apellido que no cuentan para cruzar la cita con su referencia: «da Costa» y «Costa» son el mismo autor.
const PARTICULAS = ['y', 'et', 'al', 'de', 'la', 'del', 'los', 'las', 'da', 'das', 'do', 'dos', 'di', 'du', 'van', 'von', 'der', 'den', 'le'];
const claveAutor = (apellido) => plain(apellido).replace(/[^a-z0-9ñ ]/g, '').split(/\s+/).filter((w) => !PARTICULAS.includes(w))[0] || '';
export const claveRef = (ref) => {
    if (ref.tipo === 'ley') return `${plain(ref.titulo).replace(/[^a-z0-9]/g, '').replace(/de(19|20)\d{2}$/, '')}|${t(ref.anio)}`;
    const as = leerAutores(ref.autores);
    const primero = as[0]?.institucion ? plain(as[0].apellido).replace(/[^a-z0-9ñ]/g, '') : claveAutor(as[0]?.apellido || '');
    return `${primero}|${t(ref.anio) || 's. f.'}`;
};

/* ---------- Detección de citas en el texto ---------- */

const ANIO = '(?:(?:19|20)\\d{2}[a-z]?|s\\. ?f\\.)';
const PARENTESIS = new RegExp(`\\(([^()]*?${ANIO}[^()]*?)\\)`, 'g');
const NARRATIVA = new RegExp(`((?:[A-ZÁÉÍÓÚÑ][\\wà-ÿ-]+)(?:\\s(?:y|e|&)\\s[A-ZÁÉÍÓÚÑ][\\wà-ÿ-]+|\\set al\\.)?)\\s\\((${ANIO})(?:,\\s*p{1,2}\\.\\s*[\\d–-]+)?\\)`, 'g');
const NO_AUTOR = /^(tabla|figura|anexo|nota|n|p|pp|ver|véase|como|en|el|la|los|las|desde|durante|entre|hasta|ley|decreto|resolución|resolucion|artículo|articulo)$/i;

const claveCita = (autorTexto, anio) => {
    const a = t(autorTexto);
    const esLey = /^(ley|decreto|resoluci[oó]n|acuerdo|constituci[oó]n)/i.test(a);
    if (esLey) return `${plain(a).replace(/[^a-z0-9]/g, '')}|${anio}`;
    const palabras = a.split(/\s+/);
    const institucion = palabras.length > 2 && !/\sy\s|et al/.test(a);
    return `${institucion ? plain(a).replace(/[^a-z0-9ñ]/g, '') : claveAutor(a)}|${anio}`;
};

// Devuelve [{ texto, autor, anio, clave }] con las citas encontradas en un texto.
export const citasEnTexto = (texto) => {
    const out = [];
    const s = String(texto || '');
    let m;
    // Normas nombradas en el texto: «la Ley 1581 de 2012», «Resolución 8430 de 1993».
    const NORMA = /\b(Ley|Decreto|Resoluci[oó]n|Acuerdo)\s(?:n\.?[ºo°]?\s*)?(\d+)\sde\s((?:19|20)\d{2})\b/g;
    while ((m = NORMA.exec(s))) {
        out.push({ texto: `${m[1]} ${m[2]} de ${m[3]}`, autor: `${m[1]} ${m[2]}`, anio: m[3], clave: `${plain(m[1])}${m[2]}|${m[3]}` });
    }
    PARENTESIS.lastIndex = 0;
    while ((m = PARENTESIS.exec(s))) {
        m[1].split(/;\s*/).forEach((trozo) => {
            const mm = trozo.match(new RegExp(`^(.*?),?\\s*(${ANIO})`));
            if (!mm) return;
            const autor = t(mm[1]).replace(/^(véase|ver|cf\.|e\.g\.|por ejemplo,?)\s+/i, '').replace(/,$/, '');
            if (/^(ley|decreto|resoluci[oó]n|acuerdo)\s\d+\sde$/i.test(autor)) return; // ya contada como norma
            if (!autor || /^\d/.test(autor) || autor.length > 80 || !/[A-ZÁÉÍÓÚÑ]/.test(autor.replace(/^(?:(?:da|das|do|dos|di|du|van|von|der|den|de|del|la|le)\s)+/, '')[0] || '') || /[=<>≥≤%]/.test(autor)) return;
            const anio = mm[2].replace(/\s/g, ' ');
            out.push({ texto: `(${autor}, ${anio})`, autor, anio, clave: claveCita(autor, anio.replace(/[a-z]$/, (c) => (/s\. ?f\./.test(anio) ? c : ''))) });
        });
    }
    NARRATIVA.lastIndex = 0;
    while ((m = NARRATIVA.exec(s))) {
        let autor = t(m[1]);
        // Instituciones: «Ministerio de Salud (2024)» → se extiende hacia atrás por «Mayúscula + de/del/la + …».
        let antes = s.slice(0, m.index);
        for (;;) {
            const ext = antes.match(/([A-ZÁÉÍÓÚÑ][\wà-ÿ-]+)\s((?:de|del|de la|de las|de los|para|para la|y)\s)$/);
            // Con nombre de institución ya reconocido, también se toman las mayúsculas contiguas («Organización Mundial de la…»).
            const junto = / (de|del|para) /.test(` ${autor} `) && antes.match(/([A-ZÁÉÍÓÚÑ][\wà-ÿ-]+)\s$/);
            if (ext) {
                autor = `${ext[1]} ${ext[2]}${autor}`;
                antes = antes.slice(0, ext.index);
            } else if (junto && !/^(Según|Segun|La|El|Los|Las|En|Para|Como|Y|Además|Asimismo|Por|De)$/.test(junto[1])) {
                autor = `${junto[1]} ${autor}`;
                antes = antes.slice(0, junto.index);
            } else break;
        }
        if (NO_AUTOR.test(autor.split(/\s+/)[0])) continue;
        out.push({ texto: `${autor} (${m[2]})`, autor, anio: m[2], clave: claveCita(autor, m[2]) });
    }
    return out;
};

// Campos de texto del proyecto donde se buscan citas, con el nombre de su sección.
export const CAMPOS_TEXTO = [
    ['introduccion', 'Introducción'], ['planteamiento', 'Planteamiento'], ['justificacion', 'Justificación'], ['alcances', 'Alcances'], ['limitaciones', 'Alcances'],
    ['marcoAntecedentes', 'Antecedentes'], ['marcoTeorico', 'Marco Teórico'], ['marcoConceptual', 'Marco Conceptual'], ['marcoContextual', 'Marco Contextual'], ['marcoLegal', 'Marco Legal'],
    ['metEnfoque', 'Metodología'], ['metTipo', 'Metodología'], ['metDiseno', 'Metodología'], ['poblacionSugerida', 'Metodología'], ['metPlanAnalisis', 'Metodología'], ['instrumentos', 'Metodología'],
    ['fases', 'Fases'], ['resultados', 'Resultados'], ['discusion', 'Discusión'], ['conclusiones', 'Conclusiones'], ['recomendaciones', 'Conclusiones'],
];

// Cruza las citas del proyecto con la lista de referencias.
export const revisarCitas = (data, refs) => {
    const porClave = new Map();
    CAMPOS_TEXTO.forEach(([campo, seccion]) => {
        citasEnTexto(data?.[campo]).forEach((cita) => {
            const actual = porClave.get(cita.clave) || { ...cita, secciones: [], veces: 0 };
            actual.veces += 1;
            if (!actual.secciones.includes(seccion)) actual.secciones.push(seccion);
            porClave.set(cita.clave, actual);
        });
    });
    const claves = new Map((refs || []).map((ref) => [claveRef(ref), ref]));
    const citas = [...porClave.values()];
    return {
        citas,
        sinReferencia: citas.filter((c) => !claves.has(c.clave)),
        conReferencia: citas.filter((c) => claves.has(c.clave)),
        noCitadas: (refs || []).filter((ref) => !porClave.has(claveRef(ref))),
        vecesDe: (ref) => porClave.get(claveRef(ref))?.veces || 0,
    };
};

/* ---------- Importar y exportar ---------- */

// Datos de CrossRef (api.crossref.org/works/DOI) → referencia.
export const desdeCrossref = (m) => {
    const tipo = { 'journal-article': 'articulo', book: 'libro', monograph: 'libro', 'book-chapter': 'capitulo', 'proceedings-article': 'conferencia', dissertation: 'tesis', report: 'informe' }[m.type] || 'articulo';
    const autores = (m.author || []).map((a) => (a.family ? `${a.family}, ${t(a.given).split(/[\s-]+/).filter(Boolean).map((p) => `${p[0].toUpperCase()}.`).join(' ')}` : t(a.name))).filter(Boolean).join('; ');
    const anio = String(m.issued?.['date-parts']?.[0]?.[0] || m.published?.['date-parts']?.[0]?.[0] || '');
    const contenedor = t(m['container-title']?.[0]);
    return {
        tipo, autores, anio, titulo: t(m.title?.[0]).replace(/<[^>]+>/g, ''),
        revista: tipo === 'articulo' ? contenedor : '', libro: tipo === 'capitulo' ? contenedor : '', evento: tipo === 'conferencia' ? contenedor : '',
        volumen: t(m.volume), numero: t(m.issue), paginas: t(m.page), editorial: t(m.publisher), doi: t(m.DOI),
        editores: (m.editor || []).map((a) => `${a.family}, ${t(a.given)}`).join('; '),
    };
};

const bibTipo = { articulo: 'article', libro: 'book', capitulo: 'incollection', tesis: 'thesis', informe: 'techreport', web: 'misc', ley: 'misc', conferencia: 'inproceedings' };
export const aBibtex = (refs) => (refs || []).map((ref) => {
    const clave = claveRef(ref).replace(/[^a-z0-9]/g, '').slice(0, 30) || 'ref';
    const campos = {
        author: leerAutores(ref.autores).map((a) => (a.iniciales ? `${a.apellido}, ${a.iniciales}` : `{${a.apellido}}`)).join(' and '),
        title: t(ref.titulo), year: t(ref.anio), journal: t(ref.revista), booktitle: t(ref.libro) || t(ref.evento), volume: t(ref.volumen), number: t(ref.numero),
        pages: t(ref.paginas).replace(/\s*[-–]\s*/, '--'), publisher: t(ref.editorial), school: t(ref.institucion), doi: t(ref.doi), url: t(ref.url),
    };
    return `@${bibTipo[ref.tipo] || 'misc'}{${clave},\n${Object.entries(campos).filter(([, v]) => v).map(([k, v]) => `  ${k} = {${v}}`).join(',\n')}\n}`;
}).join('\n\n');
