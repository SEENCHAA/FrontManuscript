// frontend/src/config.ts

// Определяем режим: разработка (npm run dev) или сборка (exe)
const isDev = import.meta.env.DEV;

// Если переменная __SERVER_IP__ не определена (например, при простой сборке), используем localhost
// Чтобы TypeScript не ругался, используем проверку типа
const serverIP = typeof __SERVER_IP__ !== 'undefined' ? __SERVER_IP__ : '127.0.0.1';

export const API_URL = isDev 
    ? '/api' 
    : `http://${serverIP}:8081/api`;

export const MINIO_URL = isDev 
    ? '/manuscripts' 
    : `http://${serverIP}:9000/manuscripts`;