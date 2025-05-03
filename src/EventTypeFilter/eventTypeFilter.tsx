import type { Event } from '../../data/db/dbTypes.ts';
import type { Word, WordOpts } from '../../data/util/wordUtil.ts';
import { getWord } from '../../data/util/wordUtil.ts';

export type EventTypeFilter = Word & {
    'id': string;
    'e_type': string | null;
    'e_detail': string | null;
    'e_comments': string | null;
};

function getEventTypeFilter (spec: string[], wordOpts: WordOpts): EventTypeFilter {
    return {
        ...getWord(wordOpts),
        ...{
            'e_comments': spec.length >= 2 ? spec[2] : null,
            'e_detail': spec.length >= 1 ? spec[1] : null,
            'e_type': spec.length >= 0 ? spec[0] : null,
            'id': spec.join('--'),
        },
    };
}

export function getEventTypeFilters (): EventTypeFilter[] {
    return [
        getEventTypeFilter(['Goal'], { 'singular': 'goal' }),
        getEventTypeFilter(['Goal', 'Own Goal'], { 'singular': 'own goal' }),
        getEventTypeFilter(['Goal', 'Penalty'], { 'singular': 'penalty' }),
        getEventTypeFilter(['Card', 'Red Card'], { 'singular': 'red card' }),
        getEventTypeFilter(['Card', 'Yellow Card'], { 'singular': 'yellow card' }),
        getEventTypeFilter(['subst'], { 'singular': 'substitution' }),
        getEventTypeFilter(['Var'], { 'singular': 'VAR calls' }),
    ];
}

export function filterEvent (event: Event, filter: EventTypeFilter): boolean {
    if (filter.e_type && filter.e_type !== event.e_type) {
        return false;
    }
    if (filter.e_detail && filter.e_detail !== event.e_detail) {
        return false;
    }
    if (filter.e_comments && filter.e_comments !== event.e_comments) {
        return false;
    }
    return true;
}
