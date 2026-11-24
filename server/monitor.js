// Vigilante de PROJECTSIA: proceso aparte (pm2) que revisa cada 5 minutos que el sitio y la API respondan
// y avisa por correo cuando se caen y cuando vuelven. Corre separado de la API para poder avisar si ella se cae.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';

const here = path.dirname(fileURLToPath(import.meta.url));
const envFile = path.join(here, '.env');
if (fs.existsSync(envFile) && typeof process.loadEnvFile === 'function') process.loadEnvFile(envFile);

const APP_URL = (process.env.APP_URL || 'http://localhost:5199').replace(/\/$/, '');
const PORT = Number(process.env.PORT || 8787);
const MAIL_FROM = process.env.MAIL_FROM || process.env.SMTP_USER || '';
const ALERT_EMAIL = process.env.ALERT_EMAIL || MAIL_FROM;
const EVERY_MS = 5 * 60 * 1000;

const mailer = process.env.SMTP_HOST && process.env.SMTP_USER
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 465),
        secure: Number(process.env.SMTP_PORT || 465) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || '' },
    })
    : null;

const CHECKS = [
    { id: 'api', label: 'La API (interna)', url: `http://127.0.0.1:${PORT}/api/health`, ok: async (r) => r.ok && (await r.json()).ok === true },
    { id: 'sitio', label: 'El sitio público', url: `${APP_URL}/`, ok: async (r) => r.ok },
    { id: 'api-publica', label: 'La API vista desde internet', url: `${APP_URL}/api/health`, ok: async (r) => r.ok },
];

// Se avisa a la segunda falla seguida (evita falsas alarmas por un reinicio) y otra vez al recuperarse.
const state = Object.fromEntries(CHECKS.map((c) => [c.id, { fails: 0, down: false, since: 0 }]));

const avisar = async (asunto, texto) => {
    console.log(`[${new Date().toISOString()}] ${asunto}`);
    if (!mailer || !ALERT_EMAIL || ALERT_EMAIL === 'off') return;
    try {
        await mailer.sendMail({ from: MAIL_FROM, to: ALERT_EMAIL, subject: `[PROJECTSIA] ${asunto}`, text: texto });
    } catch (error) {
        console.error('No se pudo enviar el aviso', error?.message);
    }
};

const revisar = async () => {
    for (const check of CHECKS) {
        const st = state[check.id];
        let good = false;
        let detalle = '';
        try {
            const res = await fetch(check.url, { signal: AbortSignal.timeout(15000) });
            good = await check.ok(res);
            if (!good) detalle = `Respondió ${res.status}`;
        } catch (error) {
            detalle = `${error?.name || ''} ${error?.message || ''}`.trim();
        }
        if (good) {
            if (st.down) await avisar(`${check.label} volvió a funcionar`, `Estuvo sin responder desde ${new Date(st.since).toLocaleString('es-CO')}.`);
            st.fails = 0;
            st.down = false;
        } else {
            st.fails += 1;
            if (st.fails === 1) st.since = Date.now();
            if (st.fails === 2 && !st.down) {
                st.down = true;
                await avisar(`${check.label} no responde`, `${check.url}\n${detalle}\nSin respuesta desde ${new Date(st.since).toLocaleString('es-CO')}.`);
            }
        }
    }
};

console.log(`Vigilante de PROJECTSIA: revisa ${APP_URL} cada ${EVERY_MS / 60000} minutos (correo ${mailer ? 'configurado' : 'sin configurar'}).`);
setTimeout(revisar, 20 * 1000);
setInterval(revisar, EVERY_MS);
