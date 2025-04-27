import type { Item } from '../Chart/chart.tsx';
import type * as Db from '../../data/db/dbTypes.ts';
import * as stringUtil from '../../data/util/stringUtil.ts';

type Evaluator = (event: Db.Event) => string;

type Formatter = (value: string) => string;

type XFiller = ((items: Item[]) => Item[]);

export interface Metric {
    'Plural': string;
    'Singular': string;
    'evaluator': Evaluator;
    'formatter'?: Formatter;
    'key': Db.EventKey;
    'plural': string;
    'singular': string;
    'xfiller'?: XFiller;
}

export function keyToSingular (key: string): string {
    let ret = key;

    ret = stringUtil.removePrefix(ret, 'c_');
    ret = stringUtil.removePrefix(ret, 'e_');
    ret = stringUtil.removePrefix(ret, 'f_');
    ret = stringUtil.replaceAll(ret, '_', ' ');

    return ret;
}

export function getMetric (opts: {
    'evaluator'?: Evaluator;
    'formatter'?: Formatter;
    'key': Db.EventKey;
    'plural'?: string;
    'singular'?: string;
    'xfiller'?: XFiller;
}): Metric {
    const defaultSingular = keyToSingular(opts.key);
    const singular = opts.singular || defaultSingular;

    const defaultPlural = stringUtil.singularToPlural(singular);
    const plural = opts.plural || defaultPlural;

    const defaultEvaluator: Evaluator = (item): string => (item[opts.key] || '').toString();
    const defaultFormatter: Formatter = (value): string => value;

    return {
        'Plural': stringUtil.toUppercaseFirstLetter(plural),
        'Singular': stringUtil.toUppercaseFirstLetter(singular),
        'evaluator': opts.evaluator || defaultEvaluator,
        'formatter': opts.formatter || defaultFormatter,
        'key': opts.key,
        plural,
        singular,
        'xfiller': opts.xfiller,
    };
}
