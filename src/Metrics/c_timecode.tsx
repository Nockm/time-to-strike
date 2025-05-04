import type { Item } from '../Chart/chart.tsx';
import { getBlankItem } from '../Chart/chart.tsx';

export function formatter (timecodeString: string): string {
    const timecode = parseInt(timecodeString, 10);
    const halfTime = timecode % 100;
    const halfTimeReg = Math.min(halfTime, 45);
    const halfTimeExt = Math.max(halfTime - 45, 0);

    const fullTimeReg = timecode < 200
        ? halfTimeReg
        : halfTimeReg + 45;

    const ret = halfTimeExt > 0
        ? `${fullTimeReg}+${halfTimeExt}`
        : `${fullTimeReg}`;

    return `'${ret}`;
}

function getItem (items: Item[], timecode: string): Item {
    const foundItem = items.find((item) => item.xvalue === timecode);

    return foundItem
        ? foundItem
        : {
            ...getBlankItem(),
            'xvalueformatted': formatter(timecode),
        };
}

export function filler (originalItems: Item[]): Item[] {
    const items: Item[] = [];

    for (let timecode = 101; timecode < 160; timecode += 1) {
        items.push(getItem(originalItems, timecode.toString()));
    }

    for (let timecode = 201; timecode < 260; timecode += 1) {
        items.push(getItem(originalItems, timecode.toString()));
    }

    return items;
}
