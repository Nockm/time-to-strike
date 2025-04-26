/* eslint-disable no-duplicate-imports */
import './App.css';
import { useState } from 'react';
import type { JSX } from 'react';
import * as counters from '../data/util/counters.ts';
import * as metrics from './Metrics/metrics.tsx';
import type { Metric } from './Metrics/metric.tsx';
import type * as chart from './Chart/chart.tsx';
import type * as Db from '../data/db/dbTypes.ts';
import type * as TChart from './Chart/ChartElement.tsx';
import Chart from './Chart/ChartElement.tsx';
import dbUntyped from '../data/output/db.json';
/* eslint-enable no-duplicate-imports */

const db: Db.Root = dbUntyped as Db.Root;

interface LocalisationEntry {
    'singular': string;
    'plural': string;
}

/* eslint-disable sort-keys */
const eventTypeLoc: Record<string, LocalisationEntry> = {
    'Card': { 'singular': 'card', 'plural': 'cards' },
    'Goal': { 'singular': 'goal', 'plural': 'goals' },
    'Var': { 'singular': 'VAR call', 'plural': 'VAR calls' },
    'subst': { 'singular': 'sub', 'plural': 'subs' },
};
/* eslint-enable sort-keys */

function getEventTypeLoc (key: string): LocalisationEntry {
    return eventTypeLoc[key] || { 'plural': key, 'singular': key };
}

const metricTeamName = metrics.registry.find((item) => item.key === 'e_team_name');
const metricTimecode = metrics.registry.find((item) => item.key === 'c_timecode');
const eventTypeGoal = 'Goal';

const allEventTypes: string[] = db.events.map((event) => event.e_type);
const eventTypes: string[] = counters.getUniqueValues<string>(allEventTypes);

function getChartItem (xvalue: string, metricX: Metric, eventTypeFilter: string, events: Db.Event[]): chart.Item {
    const yvalue = events.length;
    const xvalueformatted = metricX.formatter
        ? metricX.formatter(xvalue)
        : xvalue;

    const fill = xvalueformatted.includes('+')
        ? 'gray'
        : '#4c8527';

    return {
        fill,
        'tooltipHeader': `${yvalue} ${eventTypeFilter} at ${metricX.singular} ${xvalueformatted}`,
        'tooltipLines': events.sort((item1, item2) => item1.f_fixture_id - item2.f_fixture_id).map((event) => event.c_summary),
        xvalue,
        xvalueformatted,
        yvalue,
    };
}

function getChartSpec (metricX: Metric, eventTypeFilter: string, dbEvents: Db.Event[], groupName: string): TChart.Spec {
    const xvalueEventsPairs = counters.groupByToTuples<Db.Event, string>(dbEvents, metricX.evaluator);

    let chartItems: chart.Item[] = xvalueEventsPairs.map(([
        xvalue,
        events,
    ]) => getChartItem(xvalue, metricX, eventTypeFilter, events));

    if (metricX.xfiller) {
        chartItems = metricX.xfiller(chartItems);
    }

    return {
        'items': chartItems,
        'title': `[${groupName}] ${getEventTypeLoc(eventTypeFilter).plural} for each ${metricX.singular}`,
    };
}

function getChartSpecs (metricX: Metric, metricGroup: Metric, eventTypeFilter: string, dbEvents: Db.Event[]): TChart.Spec[] {
    const filteredEvents = dbEvents.filter((event) => event.e_type === eventTypeFilter);
    const nameEventsPairs = counters.groupByToTuples<Db.Event, string>(filteredEvents, metricGroup.evaluator);

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

    const selectedMetricX = metrics.registry.find((item) => item.key === selectedMetricXKey);
    if (!selectedMetricX) {
        return <div>Invalid selected key</div>;
    }

    const selectedMetricGroup = metrics.registry.find((item) => item.key === selectedMetricGroupKey);
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
                                metrics.registry.map((metric) => <option key={metric.key} value={metric.key}>{metric.plural}</option>)
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
                                metrics.registry.map((metric) => <option key={metric.key} value={metric.key}>{metric.singular}</option>)
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
                            <Chart spec={chartSpec}></Chart>
                        </div>)
                    }
                </div>
            </div>
        </div>
    );
}

export default App;
