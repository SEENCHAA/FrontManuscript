import { resolve } from 'path';
import { generateApi } from 'swagger-typescript-api';
import process from 'process';

generateApi({
    name: 'Api.ts',
    output: resolve(process.cwd(), './src/api'),
    url: 'http://localhost:8081/swagger/doc.json', 
    httpClientType: 'axios',
    generateClient: true,
    generateResponses: true,
});