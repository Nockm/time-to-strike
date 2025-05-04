import * as path from 'path';
import { readCache, writeCache } from './cache.ts';
import type { ValidResponse } from './apiResponse.ts';
import { getDirname } from '../util/pathUtil.ts';
import { isValidResponse } from './apiResponse.ts';
import { readFileSync } from 'node:fs';
const dirname = getDirname(import.meta.url);

const apikey = readFileSync(path.join(dirname, 'key.txt'), { 'encoding': 'utf-8' }).toString();

const myHeaders = new Headers();
myHeaders.append('x-rapidapi-key', apikey);
myHeaders.append('x-rapidapi-host', 'v3.football.api-sports.io');

const requestOptions: RequestInit = {
    'headers': myHeaders,
    'method': 'GET',
    'redirect': 'follow',
};

export interface CallOpts {
    'logLocalError'?: boolean;
    'logLocalSuccess'?: boolean;
    'logRemoteError'?: boolean;
    'logRemoteSuccess'?: boolean;
    'useLocal'?: boolean;
    'useRemote'?: boolean;
}

export async function call (url: string, opts: CallOpts = {
    'logLocalError': true,
    'logLocalSuccess': true,
    'logRemoteError': true,
    'logRemoteSuccess': true,
    'useLocal': true,
    'useRemote': true,
}): Promise<ValidResponse | null> {
    if (opts.useLocal) {
        const obj = readCache(url);

        if (isValidResponse(obj)) {
            if (opts.logLocalSuccess) {
                console.log(`[LOCAL OK] ${url}`);
            }

            obj.cached = true;

            return obj;
        }

        if (opts.logLocalError) {
            console.log(`[LOCAL ERROR] ${url}`);
        }
    }

    if (opts.useRemote) {
        const obj = await (await fetch(url, requestOptions)).json();

        if (isValidResponse(obj)) {
            if (opts.logRemoteSuccess) {
                console.log(`[REMOTE OK] ${url}`);
            }

            writeCache(url, obj);
            obj.cached = false;

            return obj;
        }

        if (opts.logRemoteError) {
            console.log(`[REMOTE ERROR] ${url}`);
        }
    }

    return null;
}
