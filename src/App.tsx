import './App.css';
import type { JSX } from 'react';
import { useState } from 'react'; // eslint-disable-line no-duplicate-imports
import * as counters from '../data/util/counters.ts';
import MyChart from './MyChart';
import type { ChartSpec, ChartItem } from './MyChart'; // eslint-disable-line no-duplicate-imports
import type * as Db from '../data/db/dbTypes.ts';
import dbUntyped from '../data/output/db.json';

const db: Db.Root = dbUntyped as Db.Root;

function formatTimecode (timecodeString: string): string {
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

    return ret;
}

interface LocalisationEntry {
    'singular': string;
    'plural': string;
}

/* eslint-disable sort-keys */
const eventTypeLoc: Record<string, LocalisationEntry> = {
    'Goal': { 'singular': 'goal', 'plural': 'goals' },
    'Card': { 'singular': 'card', 'plural': 'cards' },
    'subst': { 'singular': 'sub', 'plural': 'subs' },
    'Var': { 'singular': 'VAR call', 'plural': 'VAR calls' },
};

function getEventTypeLoc (key: string): LocalisationEntry {
    return eventTypeLoc[key] || { 'plural': key, 'singular': key };
}

type MetricFunc = (event: Db.Event) => string;

interface Metric {
    'formatter'?: (value: string) => string;
    'func': MetricFunc;
    'key': string;
    'plural': string;
    'singular': string;
}

const metrics: Metric[] = [
    { 'func': (item: Db.Event) => item.c_timecode.toString(), 'key': 'game time', 'singular': 'game minute', 'plural': 'game minutes', 'formatter': formatTimecode },
    { 'func': (item: Db.Event) => item.e_team_name, 'key': 'teams', 'singular': 'team', 'plural': 'teams' },
    { 'func': (item: Db.Event) => item.e_player_name, 'key': 'players', 'singular': 'player', 'plural': 'players' },
];
/* eslint-enable sort-keys */

const allEventTypes: string[] = db.events.map((event) => event.e_type);
const eventTypes: string[] = counters.getUniqueValues<string>(allEventTypes);


function getChartSpec (metricX: Metric, dbEvents: Db.Event[], groupName: string): ChartSpec {
    const metricXFunc = metricX.func;

    const timecodeEventsPairs = counters.groupByToTuples<Db.Event, string>(dbEvents, metricXFunc);

    const items: ChartItem[] = timecodeEventsPairs.map(([
        xvalue,
        events,
    ]) => {
        const yvalue = events.length;
        const xlabel = metricX.formatter
            ? metricX.formatter(xvalue)
            : xvalue;

        return {
            'fill': xlabel.includes('+')
                ? 'gray'
                : '#4c8527',
            'summaries': events.sort((item1, item2) => item1.f_fixture_id - item2.f_fixture_id).map((event) => event.c_summary),
            xlabel,
            yvalue,
        };
    });

    return {
        items,
        'title': `${groupName}: Spread of ${metricX.plural} across ${getEventTypeLoc(groupName).plural}}`,
    };
}

function getChartSpecs (metricX: Metric, metricGroup: Metric, eventTypeFilter: string, dbEvents: Db.Event[]): ChartSpec[] {
    const filteredEvents = dbEvents.filter((event) => event.e_type === eventTypeFilter);
    const nameEventsPairs = counters.groupByToTuples<Db.Event, string>(filteredEvents, metricGroup.func);

    const chartSpecs = nameEventsPairs.map(([
        name,
        events,
    ]) => getChartSpec(metricX, events, name));

    return chartSpecs;
}

function App (): JSX.Element {
    /* eslint-disable @stylistic/js/array-element-newline */
    const [count, setCount] = useState(0);
    const [selectedMetricXKey, setSelectedMetricXKey] = useState<string>(metrics[0].key);
    const [selectedMetricGroupKey, setSelectedMetricGroupKey] = useState<string>(metrics[1].key);
    const [selectedEventTypeKey, setSelectedEventTypeKey] = useState<string>(eventTypes[0]);
    /* eslint-enable @stylistic/js/array-element-newline */

    const selectedMetricX = metrics.find((item) => item.key === selectedMetricXKey);
    if (!selectedMetricX) {
        return <div>Invalid selected key</div>;
    }

    const selectedMetricGroup = metrics.find((item) => item.key === selectedMetricGroupKey);
    if (!selectedMetricGroup) {
        return <div>Invalid selected key</div>;
    }

    const chartSpecs = getChartSpecs(selectedMetricX, selectedMetricGroup, selectedEventTypeKey, db.events);

    return (
        <>
            {/* Random */}
            <button onClick={() => {
                setCount((thisCount) => thisCount + 1);
            }}>
                count is {count}
            </button>

            {/* Title */}
            <div style={{ 'fontSize': 50 }}>{new Date().toUTCString()}</div>
            <div style={{
                'display': 'flex',
                'fontSize': 50,
                'justifyContent': 'center',
            }}>
                <div style={{ 'whiteSpace': 'pre' }}>For each </div>
                <select style={{ 'fontSize': 50 }} value={selectedMetricGroupKey} onChange={(event) => {
                    setSelectedMetricGroupKey(event.target.value);
                }} >
                    {
                        metrics.map((metric) => <option key={metric.key} value={metric.key}>{metric.singular}</option>)
                    }
                </select>
                <div style={{ 'whiteSpace': 'pre' }}> show the spread of </div>


                <select style={{ 'fontSize': 50 }} value={selectedEventTypeKey} onChange={(event) => {
                    setSelectedEventTypeKey(event.target.value);
                }} >
                    {
                        eventTypes.map((eventType) => <option key={eventType} value={eventType}>{getEventTypeLoc(eventType).plural || eventType}</option>)
                    }
                </select>

                <div style={{ 'whiteSpace': 'pre' }}> across </div>
                <select style={{ 'fontSize': 50 }} value={selectedMetricXKey} onChange={(event) => {
                    setSelectedMetricXKey(event.target.value);
                }} >
                    {
                        metrics.map((metric) => <option key={metric.key} value={metric.key}>{metric.plural}</option>)
                    }
                </select>
            </div>

            {/* Charts */}
            <div className="card">
                {
                    chartSpecs.map((chartSpec) => <div key={chartSpec.title}>
                        <div style={{ 'fontSize': 30 }}>{chartSpec.title}</div>
                        <MyChart chartSpec={chartSpec}></MyChart>
                    </div>)
                }
            </div>
        </>
    );
}

export default App;
