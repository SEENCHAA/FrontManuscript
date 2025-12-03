import { MINIO_URL } from '../config';

const APP_BASE = import.meta.env.BASE_URL;

export const getImageUrl = (url: string | undefined | null): string => {
    if (!url || url === "") {
        return `${APP_BASE}placeholder.jpg`;
    }

    if (url.startsWith('http') && !url.includes('127.0.0.1') && !url.includes('localhost')) {
        return url;
    }

    let filename = url;
    if (url.includes('/manuscripts/')) {
        const parts = url.split('/manuscripts/');
        if (parts.length > 1) {
            filename = parts[1];
        }
    }
    
    filename = filename.replace(/^http:\/\/[^/]+/, '');
    filename = filename.replace(/^\//, '');

    return `${MINIO_URL}/${filename}`;
};