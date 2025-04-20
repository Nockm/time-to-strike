import type { JSX } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import db from '../data/output/db.json';
import * as counters from '../data/util/counters.ts';

const eventsByTimecode = counters.getCounter(db.events, (event) => event.timecode.toString());

const timecodeNumGoalsPairs = Object.entries(eventsByTimecode)
    .map(([
        key,
        value,
    ]) => {
        const timeCode = parseInt(key, 10);
        const numGoals = value;
        return [
            timeCode,
            numGoals,
        ];
    });

const statsPeriod1 = timecodeNumGoalsPairs
    .filter(([timeCode]) => timeCode < 200)
    .map(([
        key,
        value,
    ]) => ({ 'name': key - 100, value }));

const statsPeriod2 = timecodeNumGoalsPairs
    .filter(([timeCode]) => timeCode >= 200)
    .map(([
        key,
        value,
    ]) => ({ 'name': key - 200 + 45, value }));

export default function MyChart (): JSX.Element {
    const thing = 25;
    return (
        <>
            <div># Goals scored at each minute.</div>
            <div>First Half</div>
            <BarChart width={statsPeriod1.length * thing} height={300} data={statsPeriod1}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
            <div>Second Half</div>
            <BarChart width={statsPeriod2.length * thing} height={300} data={statsPeriod2}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
        </>
    );
}
