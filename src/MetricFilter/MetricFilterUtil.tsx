import * as TMetricFilter from './MetricFilterElement.tsx';
import type * as Db from '../../data/db/dbTypes.ts';
import * as metrics from '../Metrics/metrics.tsx';
import type { Metric } from '../Metrics/metric.tsx';

export function keyToSelectableItems (keyId: TMetricFilter.KeyId, events: Db.Event[]): TMetricFilter.SelectableVal[] {
    if (keyId === TMetricFilter.idNoSelection) {
        return [];
    }

    const allValueIds: TMetricFilter.ValId[] = keyId
        ? events.map((x) => x[keyId]?.toString() || '')
        : [];

    const uniqueValueIds: TMetricFilter.ValId[] = [...new Set(allValueIds)];

    const selectableValues: TMetricFilter.SelectableVal[] = uniqueValueIds
        .sort((a, b) => (a || '').localeCompare(b || ''))
        .map((x: TMetricFilter.ValId) => ({
            'displayName': x ? x : '(null)',
            'id': x,
        }));

    selectableValues.unshift({
        'displayName': TMetricFilter.displayNameNoSelection,
        'id': TMetricFilter.idNoSelection,
    });

    return selectableValues;
}

export function getKeyToVals (events: Db.Event[]): Record<string, TMetricFilter.SelectableVal[]> {
    const eventKeys: TMetricFilter.KeyId[] = metrics.registry.map((x) => x.key);
    eventKeys.push(TMetricFilter.idNoSelection);

    const entries: [TMetricFilter.KeyId, TMetricFilter.SelectableVal[]][] = eventKeys.map((x) => [x, keyToSelectableItems(x, events)]);

    const keyToVals: Record<string, TMetricFilter.SelectableVal[]> = Object.fromEntries(entries);

    return keyToVals;
}

export function getFilterKeys (): TMetricFilter.SelectableKey[] {
    const filterKeys: TMetricFilter.SelectableKey[] = metrics.registry.map((value: Metric) => ({
        'displayName': value.singular,
        'id': value.key,
    }));

    filterKeys.unshift({ 'displayName': TMetricFilter.displayNameNoSelection, 'id': TMetricFilter.idNoSelection });

    return filterKeys;
}

export function filterEvents (events: Db.Event[], filters: TMetricFilter.Selected[]): Db.Event[] {
    let filteredEvents = events;

    for (const filter of filters) {
        filteredEvents = filteredEvents.filter((event: Db.Event): boolean => {
            if (filter.key === TMetricFilter.idNoSelection) {
                return true;
            }
            if (filter.val === TMetricFilter.idNoSelection) {
                return true;
            }

            if (!filter.key) {
                return true;
            }

            return event[filter.key]?.toString() === filter.val;
        });
    }

    return filteredEvents;
}
