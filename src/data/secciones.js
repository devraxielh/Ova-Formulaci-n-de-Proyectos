// Secciones del menú que el estudiante construye, en su orden. El profesor decide cuáles habilita a cada grupo.
export const SECCIONES_MENU = [
    { id: 'ideacion', label: 'Ideación' },
    { id: 'titulo', label: 'Título' },
    { id: 'pregunta', label: 'Pregunta de investigación' },
    { id: 'arbol', label: 'Árbol del problema' },
    { id: 'arbolobjetivos', label: 'Árbol de objetivos' },
    { id: 'planteamiento', label: 'Planteamiento del problema' },
    { id: 'objetivos', label: 'Objetivos' },
    { id: 'justificacion', label: 'Justificación' },
    { id: 'alcances', label: 'Alcances y limitaciones' },
    { id: 'marco', label: 'Marco referencial' },
    { id: 'metodologia', label: 'Metodología' },
    { id: 'fases', label: 'Desarrollo de las fases' },
    { id: 'resultados', label: 'Resultados y discusión' },
    { id: 'conclusiones', label: 'Conclusiones' },
    { id: 'introduccion', label: 'Introducción' },
    { id: 'resumen', label: 'Resumen' },
    { id: 'referencias', label: 'Referencias' },
];

// Secciones que este usuario no puede abrir todavía (solo estudiantes con una lista de su profesor).
export const seccionesBloqueadas = (user) => (user?.role === 'student' && Array.isArray(user.secciones)
    ? new Set(SECCIONES_MENU.map((s) => s.id).filter((id) => !user.secciones.includes(id)))
    : new Set());
