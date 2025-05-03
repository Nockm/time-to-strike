/* eslint-disable sort-keys */
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

const root = document.documentElement;
const cardBar1 = getComputedStyle(root).getPropertyValue('--card-bar1')
    .trim();
const cardBar2 = getComputedStyle(root).getPropertyValue('--card-bar2')
    .trim();

const defaultGroupImageUrl = '';
const defaultGroupName = '';

const dbJson: string = b64ZipUtil.decompressString(dbJsonCompressed);
const db: Db.Root = JSON.parse(dbJson);

const filterKeys: TMetricFilter.SelectableKey[] = MetricFilterUtil.getFilterKeys();

const eventFilters: EventFilter[] = getEventFilters();

const keyToVals: Record<string, TMetricFilter.SelectableVal[]> = MetricFilterUtil.getKeyToVals(db.events);

function getChartItem (state: State, xvalue: string, events: Db.Event[]): chart.Item {
    const { metricX } = state;
    const yvalue = events.length;
    const xvalueformatted = metricX.formatter
        ? metricX.formatter(xvalue)
        : xvalue;

    const fill = xvalueformatted.includes('+')
        ? cardBar2
        : cardBar1;

    return {
        fill,
        'tooltipHeader': `${yvalue} ${state.eventFilter.plural} at ${metricX.singular} ${xvalueformatted}`,
        'tooltipLines': events.sort((item1, item2) => item1.f_fixture_id - item2.f_fixture_id).map((event) => event.c_summary),
        xvalue,
        xvalueformatted,
        yvalue,
    };
}

function getChartSpec (state: State, dbEvents: Db.Event[], groupName: string): TChart.Spec {
    const xvalueEventsPairs = counters.groupByToTuples<Db.Event, string>(dbEvents, state.metricX.evaluator);

    let chartItems: chart.Item[] = xvalueEventsPairs.map(([
        xvalue,
        events,
    ]) => getChartItem(state, xvalue, events));

    chartItems = counters.sortArrayByString(chartItems, (x) => x.xvalue);

    if (state.metricX.xfiller) {
        chartItems = state.metricX.xfiller(chartItems);
    }

    const groupImageUrl = state.metricG?.keyImageUrl
        ? dbEvents[0][state.metricG.keyImageUrl]?.toString()
        : '';

    return {
        'labelx': state.metricX.Plural,
        'labely': state.eventFilter.Plural,
        'labelg': groupName,
        'groupName': groupName || defaultGroupName,
        'groupImageUrl': groupImageUrl || defaultGroupImageUrl,
        'items': chartItems,
    };
}

function getChartSpecs (state: State, dbEvents: Db.Event[]): TChart.Spec[] {
    if (!state.metricG) {
        return [getChartSpec(state, dbEvents, '')];
    }

    const nameEventsPairs = counters.groupByToTuples<Db.Event, string>(dbEvents, state.metricG.evaluator);

    const chartSpecs = nameEventsPairs.map(([
        name,
        events,
    ]) => getChartSpec(state, events, name));

    return chartSpecs;
}

interface State {
    'eventFilter': EventFilter;
    'metricX': Metric;
    'metricG'?: Metric;
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

    if (!selectedEventFilter) {
        return <div>Invalid selected filter</div>;
    }
    if (selectedEventFilter) {
        events = events.filter((event) => eventFilterAccept(event, selectedEventFilter));
    }

    const userSelection: State = {
        'eventFilter': selectedEventFilter,
        'metricG': selectedMetricG,
        'metricX': selectedMetricX,
    };

    let chartSpecs = getChartSpecs(userSelection, events);

    const maxY = Math.max(...chartSpecs.map((x) => Math.max(...x.items.map((y) => y.yvalue))));
    chartSpecs.forEach((x) => { x.maxY = maxY; });

    chartSpecs = counters.sortArrayByString(chartSpecs, (x) => x.labelg);

    return (
        <div className="container">
            {/*
            *
            * Header
            *
            */}
            <div className="header">
                <div className="debug-text">{new Date().toUTCString()}</div>

                <div className="toolbar">
                    <div className="request">
                        <div className="request-key">Show: </div>
                        <select value={selectedEventFilterId} onChange={(event) => { setSelectedEventFilterId(event.target.value); }} >
                            {
                                eventFilters.map((eventFilter) => <option key={eventFilter.id} value={eventFilter.id}>{eventFilter.Plural}</option>)
                            }
                        </select>
                        <div className="request-key">Over: </div>
                        <select value={selectedMetricXKey} onChange={(event) => { setSelectedMetricXKey(event.target.value); }} >
                            {
                                metrics.MetricXs.map((metric) => <option key={metric.key} value={metric.key}>{metric.Plural}</option>)
                            }
                        </select>
                        <div className="request-key">Split: </div>
                        <select value={selectedMetricGKey} onChange={(event) => { setSelectedMetricGKey(event.target.value); }}>
                            <option></option>
                            {
                                metrics.MetricGs.map((metric) => <option key={metric.key} value={metric.key}>{metric.Plural}</option>)
                            }
                        </select>
                    </div>

                    <div style={{ 'width': '100%' }}></div>

                    <div className="filter">
                        <div></div>
                        <div></div>
                        <button className="filter-button" onClick={(): void => {
                            addFilter();
                        }}>Add Filter</button>
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
                </div>


            </div>
            {/*
            *
            * Filter
            *
            */}
            {/*
              *
              * Content
              *
            */}
            <div className="cards">
                <div >
                    {
                        chartSpecs.map((chartSpec, index) => <div key={index}>
                            <div className="card">
                                <div className="card-title">
                                    <div className="card-title-primary"><b>{chartSpec.labely}  ×  {chartSpec.labelx}</b></div>
                                    <div className="card-title-secondary"><div>{chartSpec.labelg}</div></div>
                                </div>
                                <div className="card-photo">
                                    <img className="card-photo-image" src={chartSpec.groupImageUrl}></img>
                                </div>
                                <div className="card-chart">
                                    <Chart spec={chartSpec}></Chart>
                                </div>
                            </div>
                        </div>)
                    }
                </div>
            </div>
        </div>
    );
}

export default App;
