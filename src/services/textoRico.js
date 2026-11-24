// Conversión entre el texto que guarda la app (negrita **así**, cursiva *así*, listas con «- » o «1. », títulos «### »)
// y el HTML que muestra el editor visual. El documento (Word, PDF, pantalla) sigue leyendo el texto de siempre.

const escapar = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// **negrita** y *cursiva* → <strong> y <em>.
export const enLinea = (texto) => escapar(texto)
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

export const aHtml = (texto) => {
    const lineas = String(texto ?? '').replace(/\r/g, '').split('\n');
    const out = [];
    let lista = null; // { tipo: 'ul' | 'ol', inicio, items }
    const cerrar = () => {
        if (!lista) return;
        out.push(`<${lista.tipo}${lista.tipo === 'ol' && lista.inicio !== 1 ? ` start="${lista.inicio}"` : ''}>${lista.items.map((i) => `<li>${enLinea(i) || '<br>'}</li>`).join('')}</${lista.tipo}>`);
        lista = null;
    };
    lineas.forEach((linea) => {
        const vin = linea.match(/^\s*[-•]\s+(.*)$/);
        const num = linea.match(/^\s*(\d+)[.)]\s+(.*)$/);
        if (vin || num) {
            const tipo = vin ? 'ul' : 'ol';
            if (lista && lista.tipo !== tipo) cerrar();
            lista = lista || { tipo, inicio: num ? Number(num[1]) : 1, items: [] };
            lista.items.push(vin ? vin[1] : num[2]);
            return;
        }
        cerrar();
        const titulo = linea.match(/^\s*#{1,6}\s+(.*)$/);
        if (titulo) out.push(`<h4>${enLinea(titulo[1].replace(/\*\*/g, ''))}</h4>`);
        else out.push(`<p>${enLinea(linea) || '<br>'}</p>`);
    });
    cerrar();
    // Un campo vacío queda realmente vacío (así se ve el texto de ejemplo).
    return String(texto ?? '').trim() === '' ? '' : out.join('');
};

const BLOQUES = new Set(['P', 'DIV', 'UL', 'OL', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE']);
const hijos = (nodo) => Array.from(nodo.childNodes || []);
const esTexto = (n) => n.nodeType === 3;

// Marca de formato alrededor de un tramo, dejando los espacios por fuera («** texto**» no funciona en Markdown).
const marcar = (texto, marca) => {
    const m = texto.match(/^(\s*)([\s\S]*?)(\s*)$/);
    return m[2] ? `${m[1]}${marca}${m[2]}${marca}${m[3]}` : texto;
};

// Contenido en línea de un nodo → texto con ** y *.
const linea = (nodo) => hijos(nodo).map((n) => {
    if (esTexto(n)) return n.textContent.replace(/ /g, ' ').replace(/\n/g, ' ');
    const nombre = n.nodeName;
    if (nombre === 'BR') return '\n';
    const dentro = linea(n);
    const estilo = (n.getAttribute && n.getAttribute('style')) || '';
    const negrita = nombre === 'STRONG' || nombre === 'B' || /font-weight:\s*(bold|[6-9]00)/.test(estilo);
    const cursiva = nombre === 'EM' || nombre === 'I' || /font-style:\s*italic/.test(estilo);
    let texto = dentro;
    if (cursiva) texto = marcar(texto, '*');
    if (negrita) texto = marcar(texto, '**');
    return texto;
}).join('');

// Limpia marcas que quedaron pegadas o vacías al combinar formatos.
const pulir = (t) => t.replace(/\*\*\*\*/g, '').replace(/(^|[^*])\*\*(\s*)\*\*(?!\*)/g, '$1$2').replace(/[ \t]+$/g, '');

/** HTML del editor (un nodo del DOM) → texto de la app. */
export const aTexto = (raiz) => {
    const lineas = [];
    let suelto = '';
    const soltar = () => { if (suelto !== '') { lineas.push(...pulir(suelto).split('\n')); suelto = ''; } };
    const bloque = (n) => {
        const nombre = n.nodeName;
        if (nombre === 'UL' || nombre === 'OL') {
            const inicio = Number(n.getAttribute && n.getAttribute('start')) || 1;
            hijos(n).filter((li) => li.nodeName === 'LI').forEach((li, i) => {
                const texto = pulir(linea(li)).replace(/\n+/g, ' ').trim();
                lineas.push(nombre === 'UL' ? `- ${texto}` : `${inicio + i}. ${texto}`);
            });
            return;
        }
        if (/^H[1-6]$/.test(nombre)) { lineas.push(`### ${pulir(linea(n)).replace(/\*/g, '').replace(/\n+/g, ' ').trim()}`); return; }
        // Un bloque que contiene otros bloques (los navegadores anidan <div>) se recorre por dentro.
        if (hijos(n).some((h) => BLOQUES.has(h.nodeName))) { recorrer(n); return; }
        lineas.push(...pulir(linea(n)).replace(/\n$/, '').split('\n'));
    };
    const recorrer = (nodo) => hijos(nodo).forEach((n) => {
        if (BLOQUES.has(n.nodeName)) { soltar(); bloque(n); } else if (n.nodeName === 'BR') { soltar(); lineas.push(''); } else suelto += esTexto(n) ? n.textContent.replace(/ /g, ' ') : linea({ childNodes: [n] });
    });
    recorrer(raiz);
    soltar();
    return lineas.map((l) => l.replace(/\s+$/, '')).join('\n').replace(/\n{3,}/g, '\n\n').replace(/^\n+|\n+$/g, '');
};
