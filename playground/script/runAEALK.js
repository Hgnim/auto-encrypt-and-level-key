import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import buildEncFiles from '../../dist/bundle/node.js';

buildEncFiles({
    rootDir: path.join(__dirname, '../aealk'),
    outputDir: '../dist/aealk',
    log: true,
    levelKeys: [
        "testKey0",
        "testKey1",
        "testKey2",
    ],
    doEnc: [
        {
            filePath: './test1.html',
            keyLevel: 0,
        }, {
            filePath: './test2.html',
            keyLevel: 1,
            output: {
                path: './test2',
                name: 'Test2.html'
            }
        }, {
            filePath: './test3.html',
            keyLevel: 2,
            output: {
                name: 'TEST3.html'
            }
        }
    ],
});