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
import * as TMetricFilter from './MetricFilter/MetricFilterElement.tsx';
import * as MetricFilterUtil from './MetricFilter/MetricFilterUtil.tsx';
import Chart from './Chart/ChartElement.tsx';
import dbJsonCompressed from '../data/output/db.dat?raw';
import * as b64ZipUtil from '../data/util/stringCompressionUtil.ts';
import MetricFilter from './MetricFilter/MetricFilterElement.tsx';
import { eventFilterAccept, getEventFilters } from './EventFilter/eventFilterUtil.tsx';
import type { EventFilter } from './EventFilter/eventFilterUtil.tsx';
/* eslint-enable no-duplicate-imports */

const dbJson: string = b64ZipUtil.decompressString(dbJsonCompressed);
const db: Db.Root = JSON.parse(dbJson);

const filterKeys: TMetricFilter.SelectableKey[] = MetricFilterUtil.getFilterKeys();

const eventFilters: EventFilter[] = getEventFilters();

const keyToVals: Record<string, TMetricFilter.SelectableVal[]> = MetricFilterUtil.getKeyToVals(db.events);

function getChartItem (xvalue: string, metricX: Metric, events: Db.Event[]): chart.Item {
    const yvalue = events.length;
    const xvalueformatted = metricX.formatter
        ? metricX.formatter(xvalue)
        : xvalue;

    const fill = xvalueformatted.includes('+')
        ? 'gray'
        : '#4c8527';

    return {
        fill,
        'tooltipHeader': `${yvalue} at ${metricX.singular} ${xvalueformatted}`,
        'tooltipLines': events.sort((item1, item2) => item1.f_fixture_id - item2.f_fixture_id).map((event) => event.c_summary),
        xvalue,
        xvalueformatted,
        yvalue,
    };
}

function getChartSpec (metricX: Metric, metricGroup: Metric | null, dbEvents: Db.Event[], groupName: string): TChart.Spec {
    const xvalueEventsPairs = counters.groupByToTuples<Db.Event, string>(dbEvents, metricX.evaluator);

    let chartItems: chart.Item[] = xvalueEventsPairs.map(([
        xvalue,
        events,
    ]) => getChartItem(xvalue, metricX, events));

    chartItems = counters.sortArrayByString(chartItems, (x) => x.xvalue);

    if (metricX.xfiller) {
        chartItems = metricX.xfiller(chartItems);
    }

    const groupImageUrl = metricGroup?.keyImageUrl
        ? dbEvents[0][metricGroup.keyImageUrl]?.toString()
        : '';

    return {
        groupImageUrl,
        'items': chartItems,
        'title': `[${groupName}] for each ${metricX.singular}`,
    };
}

function getChartSpecs (metricX: Metric, metricGroup: Metric, dbEvents: Db.Event[]): TChart.Spec[] {
    const filteredEvents = dbEvents;
    const nameEventsPairs = counters.groupByToTuples<Db.Event, string>(filteredEvents, metricGroup.evaluator);

    const chartSpecs = nameEventsPairs.map(([
        name,
        events,
    ]) => getChartSpec(metricX, metricGroup, events, name));

    return chartSpecs;
}

function App (): JSX.Element {
    const [selectedMetricXKey, setSelectedMetricXKey] = useState<string>(metrics.MetricXs[0].key);
    const [selectedMetricGKey, setSelectedMetricGKey] = useState<string>();
    const [filters, setFilters] = useState<TMetricFilter.Selected[]>([{ 'key': TMetricFilter.idNoSelection, 'val': TMetricFilter.idNoSelection }]);
    const [selectedEventFilterId, setSelectedEventFilterId] = useState<string>(eventFilters[0].id);

    const addFilter = (): void => {
        setFilters((prev) => prev.concat([{ 'key': TMetricFilter.idNoSelection, 'val': TMetricFilter.idNoSelection }]));
    };

    const deleteFilter = (index: number): void => {
        setFilters((prev) => prev.filter((_, i) => i !== index));
    };

    const updateFilter = (index: number, field: 'key' | 'val', newValue: string): void => {
        setFilters((prev) => prev.map((filter, filterIndex) => filterIndex === index ? { ...filter, [field]: newValue } : filter));
    };

    const selectedMetricX = metrics.MetricXs.find((item) => item.key === selectedMetricXKey);
    if (!selectedMetricX) {
        return <div>Invalid selected key</div>;
    }

    const selectedMetricG = metrics.MetricGs.find((item) => item.key === selectedMetricGKey);

    let events: Db.Event[] = MetricFilterUtil.filterEvents(db.events, filters);

    const selectedEventFilter = eventFilters.find((x) => x.id === selectedEventFilterId);

    if (selectedEventFilter) {
        events = events.filter((event) => eventFilterAccept(event, selectedEventFilter));
    }

    let chartSpecs = selectedMetricG
        ? getChartSpecs(selectedMetricX, selectedMetricG, events)
        : [getChartSpec(selectedMetricX, null, events, '')];

    const maxY = Math.max(...chartSpecs.map((x) => Math.max(...x.items.map((y) => y.yvalue))));
    chartSpecs.forEach((x) => { x.maxY = maxY; });

    chartSpecs = counters.sortArrayByString(chartSpecs, (x) => x.title);

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

                        <select style={{ 'fontSize': 50 }} value={selectedEventFilterId} onChange={(event) => {
                            setSelectedEventFilterId(event.target.value);
                        }} >
                            {
                                eventFilters.map((eventFilter) => <option key={eventFilter.id} value={eventFilter.id}>{eventFilter.displayName}</option>)
                            }
                        </select>

                        <div style={{ 'whiteSpace': 'pre' }}> across </div>

                        <select style={{ 'fontSize': 50 }} value={selectedMetricXKey} onChange={(event) => {
                            setSelectedMetricXKey(event.target.value);
                        }} >
                            {
                                metrics.MetricXs.map((metric) => <option key={metric.key} value={metric.key}>{metric.plural}</option>)
                            }
                        </select>
                    </div>
                    <div style={{
                        'display': 'flex',
                        'justifyContent': 'center',
                    }}>
                        <div style={{ 'whiteSpace': 'pre' }}>For each </div>
                        <select style={{ 'fontSize': 50 }} value={selectedMetricGKey} onChange={(event) => {
                            setSelectedMetricGKey(event.target.value);
                        }} >
                            <option>-- Select --</option>
                            {
                                metrics.MetricGs.map((metric) => <option key={metric.key} value={metric.key}>{metric.singular}</option>)
                            }
                        </select>
                    </div>
                </div>
            </div>
            {/*
            *
            * Filter
            *
            */}
            <button onClick={(): void => {
                addFilter();
            }}>New</button>
            <div style={{
                'display': 'flex',
                'flexDirection': 'column',
                'placeItems': 'center',
            }}>
                {
                    filters.map((filter, index) => {
                        const vals = keyToVals[filter.key];

                        return <MetricFilter
                            key={index}
                            keys={filterKeys}
                            vals={vals}
                            selected={filters[index]}
                            onDelete={() => {
                                deleteFilter(index);
                            }}
                            onKeyChange={(newKey) => {
                                updateFilter(index, 'key', newKey);
                            }}
                            onValChange={(newVal) => {
                                updateFilter(index, 'val', newVal);
                            }}
                        ></MetricFilter>;
                    })
                }
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
                            <img src={chartSpec.groupImageUrl}></img>
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
