/*
 * Temas de color de las diapositivas de sustentación. Colores en hexadecimal sin «#», como los pide pptxgenjs.
 * - primario: portada, cierre, franja lateral, títulos de tarjeta y encabezado de tablas.
 * - sobrePrimario / suavePrimario: texto principal y secundario sobre el color primario.
 * - fondo, tinta, gris: fondo y textos de las diapositivas de contenido.
 * - tarjeta, borde: cajas de cada apartado; realce, realceBorde: caja del objetivo general.
 */
export const TEMAS = [
    { id: 'indigo', nombre: 'Índigo', nota: 'El clásico de PROJECTSIA', primario: '4F46E5', sobrePrimario: 'FFFFFF', suavePrimario: 'C7D2FE', fondo: 'FFFFFF', tinta: '0F172A', gris: '475569', tarjeta: 'F1F5F9', borde: 'E2E8F0', realce: 'EEF2FF', realceBorde: 'C7D2FE', acento: '4F46E5' },
    { id: 'oceano', nombre: 'Océano', nota: 'Azul sobrio', primario: '0B5CAD', sobrePrimario: 'FFFFFF', suavePrimario: 'BFDBFE', fondo: 'FFFFFF', tinta: '0F172A', gris: '475569', tarjeta: 'EFF6FF', borde: 'DBEAFE', realce: 'DBEAFE', realceBorde: '93C5FD', acento: '0B5CAD' },
    { id: 'esmeralda', nombre: 'Esmeralda', nota: 'Verde, salud y ambiente', primario: '047857', sobrePrimario: 'FFFFFF', suavePrimario: 'A7F3D0', fondo: 'FFFFFF', tinta: '0F172A', gris: '475569', tarjeta: 'ECFDF5', borde: 'D1FAE5', realce: 'D1FAE5', realceBorde: '6EE7B7', acento: '047857' },
    { id: 'vino', nombre: 'Vino', nota: 'Formal e institucional', primario: '9F1239', sobrePrimario: 'FFFFFF', suavePrimario: 'FECDD3', fondo: 'FFFFFF', tinta: '1C1917', gris: '57534E', tarjeta: 'FFF1F2', borde: 'FFE4E6', realce: 'FFE4E6', realceBorde: 'FDA4AF', acento: '9F1239' },
    { id: 'atardecer', nombre: 'Atardecer', nota: 'Naranja cálido', primario: 'C2410C', sobrePrimario: 'FFFFFF', suavePrimario: 'FED7AA', fondo: 'FFFBF5', tinta: '1C1917', gris: '57534E', tarjeta: 'FFEDD5', borde: 'FED7AA', realce: 'FFEDD5', realceBorde: 'FDBA74', acento: 'C2410C' },
    { id: 'marino', nombre: 'Marino y oro', nota: 'Azul oscuro con dorado', primario: '0F2A4A', sobrePrimario: 'FFFFFF', suavePrimario: 'F2C94C', fondo: 'FFFFFF', tinta: '0F2A4A', gris: '475569', tarjeta: 'F8FAFC', borde: 'E2E8F0', realce: 'FEF3C7', realceBorde: 'F2C94C', acento: 'B7791F' },
    { id: 'grafito', nombre: 'Grafito', nota: 'Fondo oscuro', primario: '111827', sobrePrimario: 'FFFFFF', suavePrimario: '67E8F9', fondo: '1F2937', tinta: 'F9FAFB', gris: 'CBD5E1', tarjeta: '374151', borde: '4B5563', realce: '164E63', realceBorde: '22D3EE', acento: '67E8F9' },
    { id: 'minimal', nombre: 'Blanco y negro', nota: 'Sobrio, ahorra tinta', primario: '18181B', sobrePrimario: 'FFFFFF', suavePrimario: 'D4D4D8', fondo: 'FFFFFF', tinta: '18181B', gris: '52525B', tarjeta: 'F4F4F5', borde: 'D4D4D8', realce: 'F4F4F5', realceBorde: 'A1A1AA', acento: '18181B' },
];

export const temaDe = (id) => TEMAS.find((t) => t.id === id) || TEMAS[0];
