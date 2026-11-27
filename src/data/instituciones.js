// Fondo institucional de la CUN para la presentación: una imagen oscura para la primera diapositiva y una clara para
// las demás (public/fondos/), con los colores de texto y de las cajas que combinan con ellas.
const TEMA_CUN = {
    id: 'cun', nombre: 'Institucional CUN',
    // Colores de la «Plantilla Presentación Final – Proyecto-Seminario II»: azul oscuro en los títulos, grises en los
    // apartados y en el texto, y cajas gris claro con borde gris.
    primario: '0C2340', sobrePrimario: 'FFFFFF', suavePrimario: 'FFFFFF', fondo: 'FFFFFF', tinta: '0C2340', gris: '3C3939',
    rotulo: '1B1B27', texto: '3C3939', tarjeta: 'EDEDEF', borde: 'C7C7D0', realce: 'EDEDEF', realceBorde: 'C7C7D0', acento: '0C2340',
};

// Instituciones cuyo logo puede ir en la portada del documento. El archivo está en public/logos/ y se descarga solo
// al generar el Word. `w` y `h` son el tamaño del archivo en píxeles (se usan para conservar la proporción).
export const INSTITUCIONES = [
    { id: 'cun', nombre: 'Corporación Unificada Nacional de Educación Superior (CUN)', corto: 'CUN', logo: '/logos/cun.jpg', tipo: 'jpg', w: 508, h: 393, fondos: { portada: '/fondos/cun-portada.jpg', contenido: '/fondos/cun-contenido.jpg', tema: TEMA_CUN } },
    { id: 'unicordoba', nombre: 'Universidad de Córdoba', corto: 'Universidad de Córdoba', logo: '/logos/unicordoba.jpg', tipo: 'jpg', w: 379, h: 527 },
    { id: 'unisinu', nombre: 'Universidad del Sinú Elías Bechara Zainúm', corto: 'Universidad del Sinú', logo: '/logos/unisinu.jpg', tipo: 'jpg', w: 440, h: 313 },
    { id: 'upb', nombre: 'Universidad Pontificia Bolivariana', corto: 'UPB', logo: '/logos/upb.png', tipo: 'png', w: 360, h: 360 },
];

export const institucionDe = (id) => INSTITUCIONES.find((x) => x.id === id) || null;

// Tamaño del logo en la portada: cabe en una caja de 220 × 150 puntos, sin deformarse ni agrandarse.
export const medidaLogo = (ins, maxW = 220, maxH = 150) => {
    if (!ins?.w || !ins?.h) return { width: 0, height: 0 };
    const escala = Math.min(maxW / ins.w, maxH / ins.h, 1);
    return { width: Math.round(ins.w * escala), height: Math.round(ins.h * escala) };
};
