import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'src/styles/rail.css');
const target = resolve(root, 'dist/styles.css');

mkdirSync(resolve(root, 'dist'), { recursive: true });
copyFileSync(source, target);
console.log('Copied styles.css to dist/');
