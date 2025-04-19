import * as path from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { getDirname } from '../util/pathUtil.ts';
const dirname = getDirname(import.meta.url); // Get the name of the directory

const cacheDir = path.join(dirname, '../cache/');
const encoding = 'utf-8';
const fileExt = '.json';

const lut: Record<string, string> = {
    /* eslint-disable @typescript-eslint/naming-convention */
    '+': '.',
    '/': '-',
    '=': '_',
    /* eslint-enable @typescript-eslint/naming-convention */
};

const encodeToFilename = (id: string): string => {
    let ret = btoa(id);

    Object.keys(lut).forEach((search) => {
        const replace = lut[search];
        ret = ret.replaceAll(search, replace);
    });

    ret += fileExt;

    return ret;
};

const decodeFromFilename = (cacheFilename: string): string => {
    let ret = cacheFilename.slice(0, -fileExt.length);

    Object.keys(lut).forEach((replace) => {
        const search = lut[replace];
        ret = ret.replaceAll(search, replace);
    });

    ret = atob(ret);

    return ret;
};

const getCachePath = (key: string): string => {
    const filename = encodeToFilename(key);
    const recreatedKey = decodeFromFilename(filename);

    if (key !== recreatedKey) {
        console.log(key);
        console.log(recreatedKey);
    }

    return cacheDir + filename;
};

export const readCache: (key: string) => any = (key: string) => {
    const cachePath = getCachePath(key);
    const cacheHit = existsSync(cachePath);

    if (!cacheHit) {
        return null;
    }

    const cachedText = readFileSync(cachePath, { encoding }).toString();
    const cachedObj = JSON.parse(cachedText);

    return cachedObj;
};

export const writeCache: (key: string, val: object) => void = (key: string, val: object) => {
    const cachePath = getCachePath(key);

    if (!existsSync(cacheDir)) {
        mkdirSync(cacheDir);
    }

    const text = JSON.stringify(val, null, '\t');

    writeFileSync(cachePath, text, { 'encoding': 'utf-8' });
};
