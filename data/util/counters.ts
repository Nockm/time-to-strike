export function sortRecordByKey (record: Record<string, number>): Record<string, number> {
    return Object.fromEntries(Object.entries(record).sort(([item1], [item2]) => item1.localeCompare(item2)));
}

function sortRecordByValue (record: Record<string, number>): Record<string, number> {
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


export function getCounter<T> (items: T[], getKeyValPairFunc: (item: T) => string): Record<string, number> {
    const counter: Record<string, number> = {};

    items.forEach((item) => {
        const key: string = getKeyValPairFunc(item);

        if (!(key in counter)) {
            counter[key] = 0;
        }

        counter[key] += 1;
    });

    return sortRecordByKey(counter);

    return counter;
}

export function count<T> (
    sortKeys: boolean,
    sortVals: boolean,
    log: boolean,
    items: T[],
    getKeyValPairFunc: (item: T) => string,
): Record<string, number> {
    let counter = getCounter(items, getKeyValPairFunc);

    if (sortKeys) {
        counter = sortRecordByKey(counter);
    }
    if (sortVals) {
        counter = sortRecordByValue(counter);
    }

    if (log) {
        console.log(JSON.stringify(counter, null, 2));
    }

    return counter;
}
