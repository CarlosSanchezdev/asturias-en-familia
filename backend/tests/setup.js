import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27018/asturias-test';