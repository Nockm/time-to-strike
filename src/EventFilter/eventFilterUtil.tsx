import type * as Db from '../../data/db/dbTypes.ts';
import * as stringUtil from '../../data/util/stringUtil.ts';

export const UNSELECTED = '-- Select --';

export interface EventFilter {
    'id': string;
    'e_type': string | null;
    'e_detail': string | null;
    'e_comments': string | null;
    'displayName': string;
}

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

function getCustomEventFilter (spec: string[], displayName?: string | null): EventFilter {
    return {
        'displayName': displayName || getDisplayName(spec),
        'e_comments': spec.length >= 2 ? spec[2] : null,
        'e_detail': spec.length >= 1 ? spec[1] : null,
        'e_type': spec.length >= 0 ? spec[0] : null,
        'id': getDisplayName(spec),
    };
}

export function getEventFiltersCustom (): EventFilter[] {
    return [
        getCustomEventFilter(['Goal'], 'Goal'),
        getCustomEventFilter(['Goal', 'Own Goal'], 'Own Goal'),
        getCustomEventFilter(['Goal', 'Penalty'], 'Penalty'),
        getCustomEventFilter(['Card', 'Red Card'], 'Red Card'),
        getCustomEventFilter(['Card', 'Yellow Card'], 'Yellow Card'),
        getCustomEventFilter(['subst'], 'Substitution'),
        getCustomEventFilter(['Var'], 'VAR'),
    ];
}

export function getEventFilters (): EventFilter[] {
    return [
        getCustomEventFilter(['Goal'], 'Goal'),
        getCustomEventFilter(['Goal', 'Own Goal'], 'Own Goal'),
        getCustomEventFilter(['Goal', 'Penalty'], 'Penalty'),
        getCustomEventFilter(['Card', 'Red Card'], 'Red Card'),
        getCustomEventFilter(['Card', 'Yellow Card'], 'Yellow Card'),
        getCustomEventFilter(['subst'], 'Substitution'),
        getCustomEventFilter(['Var'], 'VAR'),
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
