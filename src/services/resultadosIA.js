/*
 * Resultados y discusión con la IA, a partir de los datos reales del proyecto:
 * las respuestas de las encuestas publicadas, las tablas que el estudiante llevó a Resultados y el análisis cualitativo.
 * La IA solo puede usar las cifras que recibe; si un objetivo no tiene datos, sus resultados quedan vacíos.
 */
import { api, groq } from './api.js';
import { analizar, fmt } from './estadistica.js';
import { tablaRespuestas } from './instrumentos.js';

const t = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
const sinPunto = (v) => t(v).replace(/[.\s]+$/, '');

// Una pregunta analizada, en una línea con sus cifras.
const lineaVariable = (v) => {
    if (v.clase === 'numerica' && v.resumen) return `«${v.nombre}» (numérica, n = ${v.resumen.n}): media ${fmt(v.resumen.media, 2)}, DE ${fmt(v.resumen.de, 2)}, mínimo ${fmt(v.resumen.min, 2)}, máximo ${fmt(v.resumen.max, 2)}`;
    if (v.clase === 'categorica' && v.frec?.items?.length) {
        const items = v.frec.items.map((x) => `${x.valor}: ${x.n} (${fmt(x.pct)} %)`).join('; ');
        return `«${v.nombre}» (${v.multiple ? 'respuesta múltiple' : 'n = '}${v.multiple ? '' : v.frec.total}): ${items}${v.puntaje ? `; puntaje promedio ${fmt(v.puntaje.media, 2)} sobre ${v.frec.items.length} (DE ${fmt(v.puntaje.de, 2)})` : ''}`;
    }
    if (v.clase === 'texto' && v.muestras?.length) return `«${v.nombre}» (abierta, ${v.n} respuestas). Ejemplos: ${v.muestras.slice(0, 3).map((m) => `«${t(m).slice(0, 120)}»`).join(' ')}`;
    return '';
};

// Junta todo lo que el proyecto ya tiene como resultado. Devuelve { texto, n, fuentes } (fuentes = cuántas hay).
export const reunirResultados = async (projectId, data) => {
    const partes = [];
    let n = 0;
    let fuentes = 0;
    // Encuestas publicadas con respuestas.
    try {
        const { surveys } = await api.surveys(projectId);
        const instrumentos = Array.isArray(data.metodologiaForm?.instrumentos) ? data.metodologiaForm.instrumentos : [];
        const armados = Array.isArray(data.instrumentosGen) ? data.instrumentosGen : [];
        for (const s of (surveys || []).filter((x) => x.count > 0)) {
            const r = await api.surveyResponses(projectId, s.instrumentId);
            const variables = analizar(tablaRespuestas(r.definition, r.responses)).map(lineaVariable).filter(Boolean);
            if (!variables.length) continue;
            const armado = armados.find((a) => a.id === s.instrumentId);
            const fila = instrumentos.find((it) => armado && it.id === armado.filaId);
            n = Math.max(n, r.responses.length);
            fuentes += 1;
            partes.push(`ENCUESTA «${t(r.definition?.titulo) || 'Encuesta'}» (n = ${r.responses.length}${fila?.objetivo ? `; sirve para ${t(fila.objetivo)}` : ''})\n${variables.map((x) => `- ${x}`).join('\n')}`);
        }
    } catch { /* sin encuestas: se sigue con lo demás */ }
    // Tablas que el estudiante ya llevó a Resultados.
    const tablas = (Array.isArray(data.elementos) ? data.elementos : []).filter((e) => e && e.seccion === 'resultados' && e.tipo === 'tabla' && Array.isArray(e.rows) && e.rows.length);
    tablas.forEach((e) => {
        fuentes += 1;
        const filas = e.rows.slice(0, 15).map((row) => `  ${(e.head || []).map((h, i) => `${t(h)}: ${t(row[i])}`).join(' · ')}`).join('\n');
        partes.push(`TABLA «${t(e.titulo)}»${e.nota ? ` (${t(e.nota)})` : ''}\n${filas}`);
    });
    // Análisis cualitativo: categorías con sus citas.
    const cual = data.cualitativo || {};
    const categorias = Array.isArray(cual.categorias) ? cual.categorias : [];
    const citas = Array.isArray(cual.citas) ? cual.citas : [];
    if (categorias.length && citas.length) {
        fuentes += 1;
        const lineas = categorias.map((c) => {
            const suyas = citas.filter((q) => q.categoria === c.id || q.categoriaId === c.id || q.categoria === c.nombre);
            return suyas.length ? `- ${t(c.nombre)} (${suyas.length} citas). Ejemplos: ${suyas.slice(0, 2).map((q) => `«${t(q.texto).slice(0, 140)}»`).join(' ')}` : '';
        }).filter(Boolean);
        if (lineas.length) partes.push(`ANÁLISIS CUALITATIVO (categorías y citas de las entrevistas)\n${lineas.join('\n')}`);
    }
    return { texto: partes.join('\n\n'), n, fuentes };
};

const RELACIONES = ['coincide con', 'difiere de', 'amplía lo reportado por'];

// Llena resultados y discusión de todos los objetivos y el cierre.
export const recomendarResultados = async ({ data, especificos, datos, antecedentes, teorias, tablas, limitacionesAlcances }) => {
    const citas = antecedentes.map((a) => `- ${a.cita}: ${t(a.hallazgo) || t(a.objetivo) || 'sin hallazgo registrado'}`).join('\n');
    const teoriasTxt = teorias.map((x) => `- ${x.nombre}: ${t(x.postulado) || ''}`).join('\n');
    const r = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'Eres asesor de investigación. Redactas los resultados y la discusión de un proyecto a partir de sus datos reales. Regla principal: solo usas las cifras, porcentajes y estadísticos que aparecen en los DATOS; nunca inventas, redondeas de otra forma ni estimas cifras. Si un objetivo no tiene datos que lo respondan, dejas vacíos sus resultados. Escribes en español, en tercera persona o forma impersonal; los resultados en pasado y sin opiniones; la discusión con lenguaje prudente («sugiere», «podría», «en esta población»). Respondes solo JSON válido.' },
            { role: 'user', content: `PROYECTO\nTítulo: ${t(data.titulo)}\nPregunta: ${t(data.pregunta)}\nObjetivos específicos:\n${especificos.map((o, i) => `${i + 1}. ${o}`).join('\n')}\n\nDATOS (lo único que puedes citar con cifras)\n${datos}\n\nANTECEDENTES DEL MARCO (usa la cita exacta)\n${citas || '(ninguno)'}\n\nTEORÍAS DEL MARCO (usa el nombre exacto)\n${teoriasTxt || '(ninguna)'}\n\nTABLAS Y FIGURAS YA EN RESULTADOS (para el apoyo visual, usa el título exacto)\n${tablas.map((x) => `- ${x}`).join('\n') || '(ninguna)'}\n\nLIMITACIONES DECLARADAS EN ALCANCES\n${limitacionesAlcances || '(ninguna)'}\n\nPara CADA objetivo específico, en orden:\n- "hallazgo": el resultado principal que responde ese objetivo, en pasado, con sus cifras exactas de los DATOS (una o dos frases). Cadena vacía si no hay datos para ese objetivo.\n- "datos": otros resultados del mismo objetivo con sus cifras (una o dos frases), o cadena vacía.\n- "apoyo": título exacto de una tabla o figura de la lista que muestre ese resultado, o cadena vacía.\n- "interpretacion": qué significa el hallazgo para el problema (una o dos frases, lenguaje prudente). Vacía si no hay hallazgo.\n- "relacion": "coincide con", "difiere de" o "amplía lo reportado por".\n- "antecedente": la cita exacta del antecedente de la lista que trate el mismo tema o una variable parecida (la discusión debe comparar con la literatura: úsalo siempre que alguno se relacione, aunque sea en parte); cadena vacía solo si ninguno tiene relación.\n- "explicacion": qué encontró ese autor y por qué coincide o difiere (una frase que empiece en minúscula). Vacía si no hay antecedente.\n- "teoria": el nombre exacto de una teoría de la lista que explique el hallazgo, o cadena vacía.\n- "teoriaExplica": cómo explica esa teoría el hallazgo (una frase en minúscula). Vacía si no hay teoría.\n- "implicacion": qué se podría hacer con este resultado (una frase, lenguaje prudente).\nY para el cierre:\n- "limitaciones": las limitaciones del estudio (dos a cuatro frases): las de Alcances que apliquen y las que se ven en los datos (tamaño de la muestra, autorreporte, un solo lugar, preguntas sin respuesta).\n- "futuras": dos o tres líneas de investigación futura que se desprenden de los resultados.\nSin punto final en ningún campo.\n\nResponde exactamente con este JSON: {"objetivos": [{"hallazgo": "…", "datos": "…", "apoyo": "…", "interpretacion": "…", "relacion": "coincide con", "antecedente": "…", "explicacion": "…", "teoria": "…", "teoriaExplica": "…", "implicacion": "…"}], "limitaciones": "…", "futuras": "…"}` },
        ],
        temperature: 0.2,
        max_tokens: 5000,
        response_format: { type: 'json_object' },
    });
    const content = r.choices?.[0]?.message?.content || '';
    const json = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
    const lista = Array.isArray(json.objetivos) ? json.objetivos : [];
    // Se reconoce la opción aunque la IA cambie puntos, tildes o mayúsculas (p. ej. «et al.» frente a «et al»).
    const plano = (v) => t(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim().replace(/^(el|la|los|las) /, '');
    const exacto = (opciones, v) => opciones.find((o) => plano(o) === plano(v)) || (plano(v).length > 3 ? opciones.find((o) => plano(o).startsWith(plano(v)) || plano(v).startsWith(plano(o))) : '') || '';
    const porObjetivo = {};
    especificos.forEach((_, i) => {
        const x = lista[i] || {};
        const apoyo = exacto(tablas, x.apoyo);
        const hallazgo = sinPunto(x.hallazgo);
        porObjetivo[i] = {
            hallazgo,
            datos: sinPunto(x.datos),
            apoyoTipo: apoyo ? 'Tabla' : '',
            apoyoTitulo: apoyo,
            apoyoNota: '',
            interpretacion: hallazgo ? sinPunto(x.interpretacion) : '',
            relacion: RELACIONES.includes(t(x.relacion)) ? t(x.relacion) : 'coincide con',
            antecedente: exacto(antecedentes.map((a) => a.cita), x.antecedente),
            explicacion: sinPunto(x.explicacion).replace(/^\p{Lu}(?=\p{Ll})/u, (l) => l.toLowerCase()),
            teoria: exacto(teorias.map((y) => y.nombre), x.teoria),
            teoriaExplica: sinPunto(x.teoriaExplica).replace(/^\p{Lu}(?=\p{Ll})/u, (l) => l.toLowerCase()),
            implicacion: hallazgo ? sinPunto(x.implicacion) : '',
            sugerido: true,
        };
        if (!porObjetivo[i].antecedente) porObjetivo[i].explicacion = '';
        if (!porObjetivo[i].teoria) porObjetivo[i].teoriaExplica = '';
    });
    return { porObjetivo, limitaciones: sinPunto(json.limitaciones), futuras: sinPunto(json.futuras) };
};

// Conclusiones y recomendaciones a partir de los resultados y la discusión ya escritos (sin datos nuevos ni citas).
export const recomendarConclusiones = async ({ data, especificos, resultados }) => {
    const porObjetivo = resultados?.porObjetivo || {};
    const general = t(data.objetivoGeneral);
    const bloques = especificos.map((o, i) => {
        const r = porObjetivo[i] || {};
        return `Objetivo ${i + 1}: ${o}\n  Hallazgo: ${t(r.hallazgo) || '(sin resultados todavía)'}${t(r.datos) ? `\n  Otros datos: ${t(r.datos)}` : ''}${t(r.interpretacion) ? `\n  Interpretación: ${t(r.interpretacion)}` : ''}${t(r.implicacion) ? `\n  Implicación: ${t(r.implicacion)}` : ''}`;
    }).join('\n');
    const r = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'Eres asesor de investigación. Redactas las conclusiones y recomendaciones de un proyecto a partir de sus resultados y su discusión. Reglas: cada conclusión responde su objetivo con lo que se encontró; no agregas datos nuevos (solo puedes retomar una cifra clave que ya esté en los resultados, igual); no citas autores; no recomiendas dentro de las conclusiones; limitas lo dicho a la población estudiada y usas lenguaje prudente. Si un objetivo no tiene resultados, su conclusión queda vacía. Escribes en español, en forma impersonal. Respondes solo JSON válido.' },
            { role: 'user', content: `PROYECTO\nTítulo: ${t(data.titulo)}\nPregunta: ${t(data.pregunta)}\nObjetivo general: ${general || '(sin definir)'}\nPoblación y lugar: ${t(data.tituloForm?.quien || data.idea?.quien)} ${t(data.tituloForm?.donde || data.idea?.donde)}\n\nRESULTADOS Y DISCUSIÓN POR OBJETIVO\n${bloques}\n\nLimitaciones: ${t(resultados?.limitaciones) || '(sin definir)'}\nFuturas investigaciones: ${t(resultados?.futuras) || '(sin definir)'}\n\nEscribe:\n- "especificas": una conclusión por objetivo, en orden (dos a cuatro oraciones cada una). Empieza retomando el verbo del objetivo en pasado impersonal (por ejemplo «Se identificó…», «Se caracterizó…») y di qué se concluye. Cadena vacía si ese objetivo no tiene resultados.\n- "general": la conclusión general (tres a cinco oraciones) que responde la pregunta de investigación y el objetivo general integrando las conclusiones específicas. Empieza con «En respuesta a la pregunta de investigación,».\n- "recomendaciones": de tres a cinco recomendaciones concretas que se desprendan de los resultados y las implicaciones. Cada una con "destinatario" (a quién va: la institución del estudio, su personal, la secretaría de salud o de educación, futuros investigadores…) y "accion" (qué hacer, empezando con un verbo en infinitivo). Incluye una para futuros investigadores a partir de las futuras investigaciones.\nSin punto final en ningún campo.\n\nResponde exactamente con este JSON: {"especificas": ["…"], "general": "…", "recomendaciones": [{"destinatario": "…", "accion": "…"}]}` },
        ],
        temperature: 0.2,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
    });
    const content = r.choices?.[0]?.message?.content || '';
    const json = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
    const lista = Array.isArray(json.especificas) ? json.especificas : [];
    const especificas = {};
    especificos.forEach((_, i) => { especificas[i] = t(porObjetivo[i]?.hallazgo) ? sinPunto(lista[i]) : ''; });
    const recomendaciones = (Array.isArray(json.recomendaciones) ? json.recomendaciones : [])
        .map((x) => ({ destinatario: sinPunto(x?.destinatario).replace(/^a\s+/i, '').slice(0, 80), accion: sinPunto(x?.accion).slice(0, 300) }))
        .filter((x) => x.accion).slice(0, 6);
    return { especificas, general: sinPunto(json.general), recomendaciones: recomendaciones.length ? recomendaciones : [{ destinatario: '', accion: '' }] };
};
