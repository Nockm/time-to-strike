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

function eventToEventFilter (event: Db.Event): EventFilter {
    let displayName = stringUtil.toUppercaseFirstLetter(event.e_type);

    if (event.e_detail) {
        displayName += `, ${event.e_detail}`;
    }

    if (event.e_comments) {
        displayName += ` (${event.e_comments})`;
    }

    return {
        displayName,
        'e_comments': event.e_comments,
        'e_detail': event.e_detail,
        'e_type': event.e_type,
        'id': [event.e_type, event.e_detail, event.e_comments].join('--'),
    };
}

export function getEventFilters (events: Db.Event[]): EventFilter[] {
    const eventFilters: [string, EventFilter][] = events.map((event: Db.Event) => {
        const eventFilter: EventFilter = eventToEventFilter(event);
        return [eventFilter.id, eventFilter];
    });

    const eventFiltersObj: Record<string, EventFilter> = Object.fromEntries<EventFilter>(eventFilters);

    const uniqueEventFilters: EventFilter[] = Object.values(eventFiltersObj);

    uniqueEventFilters.unshift({
        'displayName': UNSELECTED,
        'e_comments': null,
        'e_detail': null,
        'e_type': null,
        'id': UNSELECTED,
    });

    return uniqueEventFilters;
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
