import type { Item } from '../Chart/chart.tsx';
import type * as Db from '../../data/db/dbTypes.ts';
import * as stringUtil from '../../data/util/stringUtil.ts';
import * as wordUtil from '../../data/util/wordUtil.ts';

type Evaluator = (event: Db.Event) => string;

type Formatter = (value: string) => string;

type XFiller = ((items: Item[]) => Item[]);

export type Metric = wordUtil.Word & {
    'evaluator': Evaluator;
    'formatter'?: Formatter;
    'keyImageUrl'?: Db.EventKey;
    'key': Db.EventKey;
    'xfiller'?: XFiller;
};

function keyToSingular (key: string): string {
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
    'keyImageUrl'?: Db.EventKey;
    'plural'?: string;
    'singular'?: string;
    'xfiller'?: XFiller;
}): Metric {
    const singular = opts.singular || keyToSingular(opts.key);
    const word = wordUtil.getWord({
        'plural': opts.plural,
        singular,
    });

    const defaultEvaluator: Evaluator = (item): string => (item[opts.key] || '').toString();
    const defaultFormatter: Formatter = (value): string => value;

    return {
        ...word,
        ...{
            // 'Plural': stringUtil.toUppercaseFirstLetter(plural),
            // 'Singular': stringUtil.toUppercaseFirstLetter(singular),
            'evaluator': opts.evaluator || defaultEvaluator,
            'formatter': opts.formatter || defaultFormatter,
            'key': opts.key,
            'keyImageUrl': opts.keyImageUrl,
            // plural,
            // singular,
            'xfiller': opts.xfiller,
        },
    };
}
