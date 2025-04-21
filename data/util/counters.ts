// import { writeFileSync } from 'fs';

export function sortRecordByKey (record: Record<string, number>): Record<string, number> {
    return Object.fromEntries(Object.entries(record).sort(([item1], [item2]) => item1.localeCompare(item2)));
}

export function sortRecordByValue (record: Record<string, number>): Record<string, number> {
    return Object.fromEntries(Object.entries(record).sort(([, item1], [, item2]) => item1 - item2));
}

export function sortArrayByString<T> (array: T[], sortFunc: (item: T) => string): T[] {
    return array.sort((item1, item2) => {
        const str1 = sortFunc(item1);
        const str2 = sortFunc(item2);

        return str1.localeCompare(str2);
    });
}

export function sortArrayByNumber<T> (array: T[], sortFunc: (item: T) => number): T[] {
    return array.sort((item1, item2) => sortFunc(item1) - sortFunc(item2));
}


export function getCounter<T> (items: T[], getKey: (item: T) => string): Record<string, number> {
    const counter: Record<string, number> = {};

    items.forEach((item) => {
        const key: string = getKey(item);

        if (!(key in counter)) {
            counter[key] = 0;
        }

        counter[key] += 1;
    });

    return counter;
}


export function groupByToRecord <T, K extends string | number> (array: T[], keyFn: (arg0: T) => K): Record<K, T[]> {
    return array.reduce((acc: Record<K, T[]>, item) => {
        const key = keyFn(item);
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {} as Record<K, T[]>); // eslint-disable-line @typescript-eslint/no-unsafe-type-assertion
}

export function groupByToTuples<T, K> (array: T[], keyFn: (item: T) => K): [K, T[]][] {
    const map = new Map<K, T[]>();

    for (const item of array) {
        const key = keyFn(item);
        const group = map.get(key) ?? [];
        group.push(item);
        map.set(key, group);
    }

    return Array.from(map.entries());
}
