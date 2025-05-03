import type * as Db from '../../data/db/dbTypes.ts';
import * as stringUtil from '../../data/util/stringUtil.ts';
import type { Word, WordOpts } from '../../data/util/wordUtil.ts';
import { getWord } from '../../data/util/wordUtil.ts';

export type EventFilter = Word & {
    'id': string;
    'e_type': string | null;
    'e_detail': string | null;
    'e_comments': string | null;
};

function getDisplayName (spec: string[]): string {
    let displayName = stringUtil.toUppercaseFirstLetter(spec[0]);

    if (spec[1]) {
        displayName += `, ${spec[1]}`;
    }

    if (spec[2]) {
        displayName += ` (${spec[2]})`;
    }

    return displayName;
}

export function sortLambda<T> (array: T[], func: (item: T) => string): T[] {
    return array.sort((a: T, b: T) => func(a).localeCompare(func(b)));
}

function getCustomEventFilter (spec: string[], wordOpts?: WordOpts): EventFilter {
    const word = getWord(wordOpts || { 'singular': getDisplayName(spec) });

    return {
        ...word,
        ...{
            'e_comments': spec.length >= 2 ? spec[2] : null,
            'e_detail': spec.length >= 1 ? spec[1] : null,
            'e_type': spec.length >= 0 ? spec[0] : null,
            'id': getDisplayName(spec),
        },
    };
}

export function getEventFilters (): EventFilter[] {
    return [
        getCustomEventFilter(['Goal'], { 'singular': 'goal' }),
        getCustomEventFilter(['Goal', 'Own Goal'], { 'singular': 'own goal' }),
        getCustomEventFilter(['Goal', 'Penalty'], { 'singular': 'penalty' }),
        getCustomEventFilter(['Card', 'Red Card'], { 'singular': 'red card' }),
        getCustomEventFilter(['Card', 'Yellow Card'], { 'singular': 'yellow card' }),
        getCustomEventFilter(['subst'], { 'singular': 'substitution' }),
        getCustomEventFilter(['Var'], { 'singular': 'VAR calls' }),
    ];
}

export function eventFilterAccept (event: Db.Event, eventFilter: EventFilter): boolean {
    if (eventFilter.e_type && eventFilter.e_type !== event.e_type) {
        return false;
    }
    if (eventFilter.e_detail && eventFilter.e_detail !== event.e_detail) {
        return false;
    }
    if (eventFilter.e_comments && eventFilter.e_comments !== event.e_comments) {
        return false;
    }
    return true;
}
