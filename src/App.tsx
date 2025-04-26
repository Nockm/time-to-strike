import './App.css';
import type { JSX } from 'react';
import { useState } from 'react'; // eslint-disable-line no-duplicate-imports
import * as counters from '../data/util/counters.ts';
import * as stringUtil from '../data/util/stringUtil.ts';
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

type GapFillerInner = ((items: ChartItem[]) => ChartItem[]);

interface Metric {
    'formatter'?: (value: string) => string;
    'func': MetricFunc;
    'gapFillerInner'?: GapFillerInner;
    'key': string;
    'plural': string;
    'singular': string;
    'Plural': string;
    'Singular': string;
}

function keyToSingular (key: string): string {
    let ret = key;

    ret = stringUtil.removePrefix(ret, 'c_');
    ret = stringUtil.removePrefix(ret, 'e_');
    ret = stringUtil.removePrefix(ret, 'f_');
    ret = stringUtil.replaceAll(ret, '_', ' ');

    return ret;
}
type DbEventKey = keyof Db.Event;

function getMetric (opts: {
    'func'?: MetricFunc;
    'gapFillerInner'?: GapFillerInner;
    'key': DbEventKey;
    'singular'?: string;
    'plural'?: string;
    'formatter'?: (value: string) => string;
}): Metric {
    const { key } = opts;

    const func = opts.func || ((item: Db.Event): string => (item[key] || '').toString());

    const singular = opts.singular || keyToSingular(key);

    const plural = opts.plural || stringUtil.singularToPlural(singular);

    return {
        func,
        key,
        'formatter': opts.formatter || ((value: string): string => value),
        'gapFillerInner': opts.gapFillerInner,
        singular,
        plural,
        'Singular': singular.charAt(0).toUpperCase() + singular.slice(1),
        'Plural': plural.charAt(0).toUpperCase() + plural.slice(1),
    };
}

function gapFillerInnerTimecode (items: ChartItem[]): ChartItem[] {
    const newItems: ChartItem[] = [];

    function setTimecode (timecode: number): void {
        const timecodeString = timecode.toString();
        const foundItem = items.find((item) => item.xlabel === timecodeString);

        if (foundItem) {
            newItems.push(foundItem);
        } else {
            newItems.push({
                'fill': 'gray',
                'summaries': [],
                'xlabel': timecodeString,
                'yvalue': 0,
            });
        }
    }


    for (let timecode = 101; timecode < 160; timecode += 1) {
        setTimecode(timecode);
    }

    for (let timecode = 201; timecode < 260; timecode += 1) {
        setTimecode(timecode);
    }

    return newItems;
}

const metrics: Metric[] = [
    getMetric({ 'key': 'c_summary' }),
    getMetric({ 'key': 'c_timecode', 'formatter': formatTimecode, 'gapFillerInner': gapFillerInnerTimecode }),
    getMetric({ 'key': 'c_total_goals' }),
    getMetric({ 'key': 'e_assist_id' }),
    getMetric({ 'key': 'e_assist_name' }),
    getMetric({ 'key': 'e_comments' }),
    getMetric({ 'key': 'e_detail' }),
    getMetric({ 'key': 'e_player_id' }),
    getMetric({ 'key': 'e_player_name' }),
    getMetric({ 'key': 'e_team_id' }),
    getMetric({ 'key': 'e_team_name' }),
    getMetric({ 'key': 'e_time_elapsed' }),
    getMetric({ 'key': 'e_time_extra' }),
    getMetric({ 'key': 'e_type' }),
    getMetric({ 'key': 'f_fixture_id' }),
    getMetric({ 'key': 'f_fixture_referee' }),
    getMetric({ 'key': 'f_fixture_venue_name' }),
    getMetric({ 'key': 'f_goals_away' }),
    getMetric({ 'key': 'f_goals_home' }),
    getMetric({ 'key': 'f_league_country' }),
    getMetric({ 'key': 'f_league_id' }),
    getMetric({ 'key': 'f_league_round' }),
    getMetric({ 'key': 'f_league_season' }),
    getMetric({ 'key': 'f_lineups_0_formation' }),
    getMetric({ 'key': 'f_lineups_1_formation' }),
    getMetric({ 'key': 'f_score_fulltime_away' }),
    getMetric({ 'key': 'f_score_fulltime_home' }),
    getMetric({ 'key': 'f_teams_away_name' }),
    getMetric({ 'key': 'f_teams_home_name' }),
];
/* eslint-enable sort-keys */

const metricTeamName = metrics.find((item) => item.key === 'e_team_name');
const metricTimecode = metrics.find((item) => item.key === 'c_timecode');
const eventTypeGoal = 'Goal';

const allEventTypes: string[] = db.events.map((event) => event.e_type);
const eventTypes: string[] = counters.getUniqueValues<string>(allEventTypes);


function getChartSpec (metricX: Metric, eventTypeFilter: string, dbEvents: Db.Event[], groupName: string): ChartSpec {
    const metricXFunc = metricX.func;

    const timecodeEventsPairs = counters.groupByToTuples<Db.Event, string>(dbEvents, metricXFunc);

    let items: ChartItem[] = timecodeEventsPairs.map(([
        xvalue,
        events,
    ]) => {
        const yvalue = events.length;
        const xlabel = xvalue;

        return {
            'fill': 'black',
            'summaries': events.sort((item1, item2) => item1.f_fixture_id - item2.f_fixture_id).map((event) => event.c_summary),
            xlabel,
            yvalue,
        };
    });

    if (metricX.gapFillerInner) {
        items = metricX.gapFillerInner(items);
    }

    for (const item of items) {
        item.xlabel = metricX.formatter
            ? metricX.formatter(item.xlabel)
            : item.xlabel;
        item.fill = item.xlabel.includes('+')
            ? 'gray'
            : '#4c8527';
    }

    return {
        items,
        'title': `[${groupName}] ${getEventTypeLoc(eventTypeFilter).plural} for each ${metricX.singular}`,
    };
}

function getChartSpecs (metricX: Metric, metricGroup: Metric, eventTypeFilter: string, dbEvents: Db.Event[]): ChartSpec[] {
    const filteredEvents = dbEvents.filter((event) => event.e_type === eventTypeFilter);
    const nameEventsPairs = counters.groupByToTuples<Db.Event, string>(filteredEvents, metricGroup.func);

    const chartSpecs = nameEventsPairs.map(([
        name,
        events,
    ]) => getChartSpec(metricX, eventTypeFilter, events, name));

    return chartSpecs;
}

function App (): JSX.Element {
    /* eslint-disable @stylistic/js/array-element-newline */
    const [selectedMetricXKey, setSelectedMetricXKey] = useState<string>(metricTimecode?.key || '');
    const [selectedMetricGroupKey, setSelectedMetricGroupKey] = useState<string>(metricTeamName?.key || '');
    const [selectedEventTypeKey, setSelectedEventTypeKey] = useState<string>(eventTypeGoal);
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
        <div className="container">
            {/*
            *
            * Header
            *
            */}
            <div
                className="header"
                style={{
                    'fontSize': 50,
                }}>

                <div style={{ 'fontSize': 50 }}>{new Date().toUTCString()}</div>

                <div>
                    <div style={{
                        'display': 'flex',
                        'justifyContent': 'center',
                    }}>
                        <div style={{ 'whiteSpace': 'pre' }}>Show </div>

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
                    <div style={{
                        'display': 'flex',
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
                    </div>
                </div>
            </div>
            {/*
              *
              * Content
              *
            */}
            <div className="content">
                {/* Charts */}
                <div>
                    {
                        chartSpecs.map((chartSpec) => <div key={chartSpec.title}>
                            <div style={{ 'fontSize': 30 }}>{chartSpec.title}</div>
                            <MyChart chartSpec={chartSpec}></MyChart>
                        </div>)
                    }
                </div>
            </div>
        </div>
    );
}

export default App;
