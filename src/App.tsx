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
    /* eslint-disable @stylistic/js/no-multi-spaces */
    { 'func': (item: Db.Event) => item.c_summary,                         'key': 'c_summary',             'singular': 'c_summary',              'plural': 'c_summary' },
    { 'func': (item: Db.Event) => item.c_timecode.toString(),             'key': 'game time',             'singular': 'game minute',            'plural': 'game minutes', 'formatter': formatTimecode },
    { 'func': (item: Db.Event) => item.c_total_goals.toString(),          'key': 'c_total_goals',         'singular': 'c_total_goals',          'plural': 'c_total_goals' },
    { 'func': (item: Db.Event) => item.e_assist_id?.toString() || '',     'key': 'e_assist_id',           'singular': 'e_assist_id',            'plural': 'e_assist_id' },
    { 'func': (item: Db.Event) => item.e_assist_name || '',               'key': 'e_assist_name',         'singular': 'e_assist_name',          'plural': 'e_assist_name' },
    { 'func': (item: Db.Event) => item.e_comments,                        'key': 'e_comments',            'singular': 'e_comments',             'plural': 'e_comments' },
    { 'func': (item: Db.Event) => item.e_detail,                          'key': 'e_detail',              'singular': 'e_detail',               'plural': 'e_detail' },
    { 'func': (item: Db.Event) => item.e_player_id.toString(),            'key': 'e_player_id',           'singular': 'e_player_id',            'plural': 'e_player_id' },
    { 'func': (item: Db.Event) => item.e_player_name,                     'key': 'players',               'singular': 'player',                 'plural': 'players' },
    { 'func': (item: Db.Event) => item.e_team_id.toString(),              'key': 'e_team_id',             'singular': 'e_team_id',              'plural': 'e_team_id' },
    { 'func': (item: Db.Event) => item.e_team_name,                       'key': 'teams',                 'singular': 'team',                   'plural': 'teams' },
    { 'func': (item: Db.Event) => item.e_time_elapsed.toString(),         'key': 'e_time_elapsed',        'singular': 'e_time_elapsed',         'plural': 'e_time_elapsed' },
    { 'func': (item: Db.Event) => item.e_time_extra?.toString() || '',    'key': 'e_time_extra',          'singular': 'e_time_extra',           'plural': 'e_time_extra' },
    { 'func': (item: Db.Event) => item.e_type,                            'key': 'e_type',                'singular': 'e_type',                 'plural': 'e_type' },
    { 'func': (item: Db.Event) => item.f_fixture_id.toString(),           'key': 'f_fixture_id',          'singular': 'f_fixture_id',           'plural': 'f_fixture_id' },
    { 'func': (item: Db.Event) => item.f_fixture_referee,                 'key': 'f_fixture_referee',     'singular': 'f_fixture_referee',      'plural': 'f_fixture_referee' },
    { 'func': (item: Db.Event) => item.f_fixture_venue_name,              'key': 'f_fixture_venue_name',  'singular': 'f_fixture_venue_name',   'plural': 'f_fixture_venue_name' },
    { 'func': (item: Db.Event) => item.f_goals_away.toString(),           'key': 'f_goals_away',          'singular': 'f_goals_away',           'plural': 'f_goals_away' },
    { 'func': (item: Db.Event) => item.f_goals_home.toString(),           'key': 'f_goals_home',          'singular': 'f_goals_home',           'plural': 'f_goals_home' },
    { 'func': (item: Db.Event) => item.f_league_country,                  'key': 'f_league_country',      'singular': 'f_league_country',       'plural': 'f_league_country' },
    { 'func': (item: Db.Event) => item.f_league_id.toString(),            'key': 'f_league_id',           'singular': 'f_league_id',            'plural': 'f_league_id' },
    { 'func': (item: Db.Event) => item.f_league_round,                    'key': 'f_league_round',        'singular': 'f_league_round',         'plural': 'f_league_round' },
    { 'func': (item: Db.Event) => item.f_league_season.toString(),        'key': 'f_league_season',       'singular': 'f_league_season',        'plural': 'f_league_season' },
    { 'func': (item: Db.Event) => item.f_lineups_0_formation,             'key': 'f_lineups_0_formation', 'singular': 'f_lineups_0_formation',  'plural': 'f_lineups_0_formation' },
    { 'func': (item: Db.Event) => item.f_lineups_1_formation,             'key': 'f_lineups_1_formation', 'singular': 'f_lineups_1_formation',  'plural': 'f_lineups_1_formation' },
    { 'func': (item: Db.Event) => item.f_score_fulltime_away.toString(),  'key': 'f_score_fulltime_away', 'singular': 'f_score_fulltime_away',  'plural': 'f_score_fulltime_away' },
    { 'func': (item: Db.Event) => item.f_score_fulltime_home.toString(),  'key': 'f_score_fulltime_home', 'singular': 'f_score_fulltime_home',  'plural': 'f_score_fulltime_home' },
    { 'func': (item: Db.Event) => item.f_teams_away_name,                 'key': 'f_teams_away_name',     'singular': 'f_teams_away_name',      'plural': 'f_teams_away_name' },
    { 'func': (item: Db.Event) => item.f_teams_home_name,                 'key': 'f_teams_home_name',     'singular': 'f_teams_home_name',      'plural': 'f_teams_home_name' },
    /* eslint-enable @stylistic/js/no-multi-spaces */
];
/* eslint-enable sort-keys */

const allEventTypes: string[] = db.events.map((event) => event.e_type);
const eventTypes: string[] = counters.getUniqueValues<string>(allEventTypes);


function getChartSpec (metricX: Metric, eventTypeFilter: string, dbEvents: Db.Event[], groupName: string): ChartSpec {
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
        <div className="container">
            <div className="header">
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
            </div>
            <div className="content">
                {/* Charts */}
                <div className="card">
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
