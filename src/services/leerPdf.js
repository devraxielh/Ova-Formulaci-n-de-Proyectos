// Texto de un PDF, renglón por renglón (solo en el navegador). Usa la versión «legacy» de pdf.js, que funciona
// también en navegadores algo antiguos. Un PDF escaneado (imagen) no trae texto: se avisa en vez de evaluar en blanco.
import { lineasDePagina } from './evaluacionDoc.js';

export const leerPdf = async (buffer) => {
    const [pdfjs, { default: PdfWorker }] = await Promise.all([
        import('pdfjs-dist/legacy/build/pdf.mjs'),
        import('./pdfWorker.js?worker'),
    ]);
    if (!pdfjs.GlobalWorkerOptions.workerPort) pdfjs.GlobalWorkerOptions.workerPort = new PdfWorker();
    const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer), isEvalSupported: false }).promise;
    const renglones = [];
    for (let n = 1; n <= doc.numPages; n += 1) {
        // eslint-disable-next-line no-await-in-loop
        const pagina = await doc.getPage(n);
        // eslint-disable-next-line no-await-in-loop
        const { items } = await pagina.getTextContent();
        renglones.push(...lineasDePagina(items));
    }
    const paginas = doc.numPages;
    await doc.destroy();
    if (renglones.join(' ').replace(/\s/g, '').length < 200) throw new Error('El PDF casi no tiene texto: parece escaneado (una imagen). Sube el Word o un PDF exportado desde Word.');
    return { renglones, paginas };
};
