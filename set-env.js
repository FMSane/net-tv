const fs = require('fs');

const dir = './src/environments';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// Toma la variable de Vercel, o usa el localhost si estás desarrollando en tu PC
const apiUrl = process.env.API_URL || 'http://localhost:8080/api';

const envConfigFile = `
export const environment = {
  apiUrl: '${apiUrl}'
};
`;

fs.writeFileSync(`${dir}/environment.ts`, envConfigFile);
console.log(`✅ Archivo environment.ts generado con la URL: ${apiUrl}`);