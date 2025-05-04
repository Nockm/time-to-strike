/* eslint-disable @typescript-eslint/naming-convention */
import * as stringUtil from './stringUtil.ts';

export interface WordOpts {
    'plural'?: string;
    'singular': string;
}

export interface Word {
    'Plural': string;
    'Singular': string;
    'plural': string;
    'singular': string;
}

export function getWord (opts: WordOpts): Word {
    const { singular } = opts;

    const defaultPlural = stringUtil.singularToPlural(singular);
    const plural = opts.plural || defaultPlural;

    return {
        'Plural': stringUtil.toUppercaseFirstLetter(plural),
        'Singular': stringUtil.toUppercaseFirstLetter(singular),
        plural,
        singular,
    };
}

export function quantUpper (word: Word, count: number): string {
    return count === 1 ? word.Singular : word.Plural;
}

export function quantLower (word: Word, count: number): string {
    return count === 1 ? word.singular : word.plural;
}
