import { describe, expect, it } from 'vitest';
import * as counters from '../../data/util/counters';

function ser (item: any): string {
    return JSON.stringify(item, null, 0);
}

describe('counters', () => {
    it('groupBy', () => {
        const data1 = [
            1,
            2,
            3,
            4,
            5,
            6,
        ];

        const groupByToRecordResult = counters.groupByToRecord(data1, (item) => (item % 2 === 0).toString());
        const groupByToTuplesResult = counters.groupByToTuples(data1, (item) => item % 2 === 0);

        expect(ser(groupByToRecordResult)).toBe(ser({ 'false': [
            1,
            3,
            5,
        ], 'true': [
            2,
            4,
            6,
        ] }));

        expect(ser(groupByToTuplesResult)).toBe(ser([
            [
                false,
                [
                    1,
                    3,
                    5,
                ],
            ],
            [
                true,
                [
                    2,
                    4,
                    6,
                ],
            ],
        ]));
    });
});
