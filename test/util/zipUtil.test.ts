import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { ensureEmptyDir, getDirname } from '../../data/util/pathUtil';
import { compressString, decompressString } from '../../data/util/stringCompressionUtil';
import { readFileSync, writeFileSync } from 'node:fs';

describe('zipUtil', () => {
    it('should work', () => {
        const resourceDir = path.join(getDirname(import.meta.url), 'resources');
        ensureEmptyDir(resourceDir);

        const baseFilename = 'test.txt';
        const fileTxt = `${resourceDir}/${baseFilename}`;
        const fileTxtZip = `${fileTxt}.zip`;
        const fileTxtZipB64 = `${fileTxtZip}.b64`;

        const rawText1 = 'abcde';
        const rawText1Compressed = compressString(rawText1);
        writeFileSync(fileTxtZipB64, rawText1Compressed);
        const rawText2Compressed = readFileSync(fileTxtZipB64, { 'encoding': 'utf-8' });
        const rawText2 = decompressString(rawText2Compressed);

        expect(rawText1).to.equal(rawText2);
    });
});
