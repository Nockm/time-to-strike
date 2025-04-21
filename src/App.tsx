import './App.css';
import type { JSX } from 'react';
import { useState } from 'react'; // eslint-disable-line no-duplicate-imports
import * as counters from '../data/util/counters.ts';
import db from '../data/output/db.json';
import MyChart from './MyChart';
import type { ChartSpec, ChartItem } from './MyChart'; // eslint-disable-line no-duplicate-imports
import type * as Db from '../data/db/dbTypes.ts';

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

type MetricFunc = (event: Db.Event) => string;

interface Metric {
    'formatter'?: (value: string) => string;
    'func': MetricFunc;
    'name': string;
}

const metrics: Metric[] = [
    { 'formatter': formatTimecode, 'func': (item: Db.Event) => item.timecode.toString(), 'name': 'Time' },
    { 'func': (item: Db.Event) => item['team.name'], 'name': 'Team' },
];


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
            'summaries': events.sort((item1, item2) => item1.fixtureId - item2.fixtureId).map((event) => event.summary),
            xlabel,
            yvalue,
        };
    });

    return {
        items,
        'title': `${metricX.name} vs ${groupName}`,
    };
}

function getChartSpecs (metricX: Metric, metricGroup: Metric, dbEvents: Db.Event[]): ChartSpec[] {
    const nameEventsPairs = counters.groupByToTuples<Db.Event, string>(dbEvents, metricGroup.func);

    const chartSpecs = nameEventsPairs.map(([
        name,
        events,
    ]) => getChartSpec(metricX, events, name));

    return chartSpecs;
}

function App (): JSX.Element {
    const [
        count,
        setCount,
    ] = useState(0);

    const [
        selectedMetricXKey,
        setSelectedMetricXKey,
    ] = useState<string>(metrics[0].name);

    const [
        selectedMetricGroupKey,
        setSelectedMetricGroupKey,
    ] = useState<string>(metrics[1].name);

    const selectedMetricX = metrics.find((item) => item.name === selectedMetricXKey);

    if (!selectedMetricX) {
        return <div>Invalid selected key</div>;
    }

    const selectedMetricGroup = metrics.find((item) => item.name === selectedMetricGroupKey);

    if (!selectedMetricGroup) {
        return <div>Invalid selected key</div>;
    }

    const chartSpecs = getChartSpecs(selectedMetricX, selectedMetricGroup, db.events);

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

            {/* Options */}
            <div >
                <div>
                    <select value={selectedMetricXKey} onChange={(event) => {
                        setSelectedMetricXKey(event.target.value);
                    }} >
                        {
                            metrics.map((metric) => <option key={metric.name} value={metric.name}>{metric.name}</option>)
                        }
                    </select>

                    <select value={selectedMetricGroupKey} onChange={(event) => {
                        setSelectedMetricGroupKey(event.target.value);
                    }} >
                        {
                            metrics.map((metric) => <option key={metric.name} value={metric.name}>{metric.name}</option>)
                        }
                    </select>
                </div>
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
