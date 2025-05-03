import type { Event } from '../../data/db/dbTypes.ts';
import * as metrics from '../Metrics/metrics.tsx';
import type { Metric } from '../Metrics/metric.tsx';
import type { DynamicEventFilter, EventKey, EventKeyId, EventVal, EventValId } from './DynamicEventFilterElement.tsx';

export function eventKeyIdToEventVals (eventKeyId: EventKeyId, events: Event[]): EventVal[] {
    if (eventKeyId === null) {
        return [];
    }

    const allEventValIds: EventValId[] = eventKeyId
        ? events.map((x) => x[eventKeyId]?.toString() || '')
        : [];

    const uniqueEventValIds: EventValId[] = [...new Set(allEventValIds)];

    const eventVals: EventVal[] = uniqueEventValIds
        .sort((a, b) => (a || '').localeCompare(b || ''))
        .map((x: EventValId) => ({
            'id': x,
            'name': x ? x : '(null)',
        }));

    eventVals.unshift({ 'id': null, 'name': '...' });

    return eventVals;
}

export function getEventKeyToValsLut (events: Event[]): Record<string, EventVal[]> {
    const eventKeyIds: EventKeyId[] = [
        null,
        ...metrics.metricList.map((x) => x.id),
    ];

    const entries: [EventKeyId, EventVal[]][] = eventKeyIds.map((eventKeyId) => [eventKeyId, eventKeyIdToEventVals(eventKeyId, events)]);

    const lut: Record<string, EventVal[]> = Object.fromEntries(entries);

    return lut;
}

export function getFilterEventKeys (): EventKey[] {
    const eventKeys: EventKey[] = metrics.MetricFs.map((value: Metric) => ({
        'id': value.id,
        'name': value.singular,
    }));

    eventKeys.unshift({ 'id': null, 'name': '...' });

    return eventKeys;
}

export function filterEvent (event: Event, filter: DynamicEventFilter): boolean {
    if (filter.eventKey === null) {
        return true;
    }
    if (filter.eventVal === null) {
        return true;
    }

    if (!filter.eventKey) {
        return true;
    }

    return event[filter.eventKey]?.toString() === filter.eventVal;
}

export function filterEvents (events: Event[], filters: DynamicEventFilter[]): Event[] {
    let filteredEvents = events;

    for (const filter of filters) {
        filteredEvents = filteredEvents.filter((event: Event): boolean => filterEvent(event, filter));
    }

    return filteredEvents;
}
