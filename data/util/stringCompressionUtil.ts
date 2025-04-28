import { zipSync, strToU8, unzipSync, strFromU8 } from 'fflate';
import { Buffer } from 'buffer';

// Deprecated

export function b64ToU8BrowserSafe (b64: string): Uint8Array {
    return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

export function u8ToB64BrowserSafe (u8: Uint8Array): string {
    return btoa(Array.from(u8).map((byte) => String.fromCharCode(byte))
        .join(''));
}

// Single steps

function u8ToB64 (u8: Uint8Array): string {
    return Buffer.from(u8).toString('base64');
}

function b64ToU8 (b64: string): Uint8Array {
    return Buffer.from(b64, 'base64');
}

function u8ToZip (u8: Uint8Array, zipKey: string): Uint8Array {
    return zipSync({
        [zipKey]: u8,
    }, {
        'level': 9 as const,
        'mtime': new Date('1/1/1980'),
    });
}

function zipToU8 (zip: Uint8Array, zipKey: string): Uint8Array {
    return unzipSync(zip)[zipKey];
}

// Multiple steps

function strToZipB64 (str: string, zipKey: string): string {
    const u8 = strToU8(str);
    const zip = u8ToZip(u8, zipKey);
    const zipB64 = u8ToB64(zip);
    return zipB64;
}

function zipB64ToStr (zipB64: string, zipKey: string): string {
    const zip = b64ToU8(zipB64);
    const u8 = zipToU8(zip, zipKey);
    const str = strFromU8(u8);
    return str;
}

// Interface

const zipKey = 'db.json';

export function compressString (str: string): string {
    return strToZipB64(str, zipKey);
}

export function decompressString (str: string): string {
    return zipB64ToStr(str, zipKey);
}
