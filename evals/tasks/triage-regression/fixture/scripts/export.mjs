import { readFileSync } from 'node:fs';
import { ordersCsv } from '../src/export.mjs';

process.stdout.write(ordersCsv(JSON.parse(readFileSync(new URL('../data/orders.json', import.meta.url), 'utf8'))));
