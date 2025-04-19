import * as path from 'path';
import { describe, expect, it } from 'vitest';
import { getDirname } from '../../data/util/pathUtil';
import { isValidResponse } from '../../data/api/apiResponse';
import { readFileSync } from 'node:fs';

function parseResource (filename: string): object {
    const text: string = readFileSync(path.join(getDirname(import.meta.url), 'resources', filename)).toString();
    const obj = JSON.parse(text);
    return obj;
}

function dataIsValid (obj: unknown): boolean {
    return isValidResponse(obj);
}

describe('isValidHttpResponse', () => {
    it('error___FakeArray', () => {
        expect(dataIsValid(parseResource('error___FakeArray.json'))).toBe(false);
    });

    it('error__Fixtures__Id__RateLimit', () => {
        expect(dataIsValid(parseResource('error__Fixtures__Id__RateLimit.json'))).toBe(false);
    });

    it('error__Fixtures__Id__Requests', () => {
        expect(dataIsValid(parseResource('error__Fixtures__Id__Requests.json'))).toBe(false);
    });

    it('error__Status__Requests', () => {
        expect(dataIsValid(parseResource('error__Status__Requests.json'))).toBe(false);
    });

    it('success__Fixtures__Id', () => {
        expect(dataIsValid(parseResource('success__Fixtures__Id.json'))).toBe(true);
    });

    it('success__Fixtures__League_Season_Status', () => {
        expect(dataIsValid(parseResource('success__Fixtures__League_Season_Status.json'))).toBe(true);
    });

    it('success__Status', () => {
        expect(dataIsValid(parseResource('success__Status.json'))).toBe(true);
    });
});
