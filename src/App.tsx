/* eslint-disable no-constant-binary-expression */

import './App.css';
import { useState } from 'react';
import type { JSX } from 'react';
import type * as Db from '../data/db/dbTypes.ts';
import dbJsonCompressed from '../data/output/db.dat?raw';
import * as counters from '../data/util/counters.ts';
import * as b64ZipUtil from '../data/util/stringCompressionUtil.ts';
import ChartElement from './Chart/ChartElement.tsx';
import { getChartSpecs } from './chartSpecUtil.ts';
import * as dynamicEventFilter from './DynamicEventFilter/dynamicEventFilter.tsx';
import * as eventTypeFilter from './EventTypeFilter/eventTypeFilter.tsx';
import * as metrics from './Metrics/metrics.tsx';
import { Select } from './styledElements.tsx';

// Decompress and parse the database.
const dbJson: string = b64ZipUtil.decompressString(dbJsonCompressed);
const db: Db.Root = JSON.parse(dbJson);

// Get metrics.
const filterKeys: dynamicEventFilter.EventKey[] = dynamicEventFilter.getFilterEventKeys();

// Get events.
const eventFilters: eventTypeFilter.EventTypeFilter[] = eventTypeFilter.getEventTypeFilters();

// Pre-compute LUT for dynamic filters.
const keyToVals: Record<string, dynamicEventFilter.EventVal[]> = dynamicEventFilter.getEventKeyToValsLut(db.events);

function App (): JSX.Element {
    // State.
    const [metricXId, setMetricXId] = useState<string>(metrics.MetricXs[0].id);
    const [filterYId, setFilterYId] = useState<string>(eventFilters[0].id);
    const [metricGId, setMetricGId] = useState<string>();
    const [filters, setFilters] = useState<dynamicEventFilter.DynamicEventFilter[]>([{ 'eventKey': null, 'eventVal': '...' }]);

    const addFilter = (): void => {
        setFilters((prev) => prev.concat([{ 'eventKey': null, 'eventVal': '...' }]));
    };

    const deleteFilter = (index: number): void => {
        setFilters((prev) => prev.filter((_, i) => i !== index));
    };

    const updateFilter = (index: number, field: keyof dynamicEventFilter.DynamicEventFilter, newValue: string): void => {
        setFilters((prev) => prev.map((filter, filterIndex) => filterIndex === index ? { ...filter, [field]: newValue } : filter));
    };

    // Validate state.
    const metricX = metrics.MetricXs.find((x) => x.id === metricXId);
    const metricG = metrics.MetricGs.find((x) => x.id === metricGId);
    const filterY = eventFilters.find((x) => x.id === filterYId);

    if (!metricX) {
        return <div>Invalid selected X</div>;
    }

    if (!filterY) {
        return <div>Invalid selected Y</div>;
    }

    // Filter events.
    let events: Db.Event[] = db.events;
    events = events.filter((event) => eventTypeFilter.filterEvent(event, filterY));
    events = dynamicEventFilter.filterEvents(events, filters);

    // Get chart parameters.
    let chartSpecs = getChartSpecs({
        filterY,
        metricG,
        metricX,
    }, events);

    // Calculate the largest y-value; all charts will have this extent.
    const globalMaxY = Math.max(...chartSpecs.map((x) => Math.max(...x.items.map((y) => y.yvalue))));
    chartSpecs.forEach((x) => { x.maxY = globalMaxY; });

    // Sort charts in alphabetical order.
    chartSpecs = counters.sortArrayByString(chartSpecs, (x) => x.labelG);

    chartSpecs = chartSpecs.slice(0, 50);

    return (
        <div className="app bg-zinc-100">
            <h2 className="grid grid-cols-1 items-center p-2 font-bold bg-zinc-900 text-zinc-100">
                <div className="row-1 col-1 justify-self-start">
                    <div className="logo-text">⚽ TIME TO STRIKE</div>
                </div>
                <div className="row-1 col-1 justify-self-center">
                    <div className="debug-text">{new Date().toUTCString()}</div>
                </div>
                <div className="row-1 col-1 justify-self-end">
                    <div className="status-text">Premier League Stats Seasons 2021 - 2024</div>
                </div>
            </h2>
            <div className="app-toolbar m-8">
                <div className="grid grid-cols-1 items-center">
                    {/* Left */}
                    <div className="row-1 col-1 justify-self-start">
                    </div>
                    {/* Middle */}
                    <div className="row-1 col-1 justify-self-center">
                        <h1 className="grid grid-rows-1 grid-cols-[auto_auto_auto_auto] items-center gap-4">
                            <div>Compare </div>
                            <Select value={filterYId} onChange={(event) => { setFilterYId(event.target.value); }}>
                                { eventFilters.map((eventFilter) => <option key={eventFilter.id} value={eventFilter.id}>{eventFilter.Plural}</option>) }
                            </Select>
                            <div> against </div>
                            <Select value={metricXId} onChange={(event) => { setMetricXId(event.target.value); }}>
                                { metrics.MetricXs.map((metric) => <option key={metric.id} value={metric.id}>{metric.Plural}</option>) }
                            </Select>
                        </h1>
                    </div>
                    {/* Right */}
                    <div className="row-1 col-1 justify-self-end">
                        <h2 className="grid grid-cols-[auto_auto_auto_auto] items-center gap-2">
                            {/* 1 */}
                            <div>Split results into:</div>
                            {/* 2 - 4 */}
                            <Select className="col-span-3" value={metricGId || ''} onChange={(event) => { setMetricGId(event.target.value); }}>
                                <option>-- Select --</option>
                                { metrics.MetricGs.map((metric) => <option key={metric.id} value={metric.id}>{metric.Plural}</option>) }
                            </Select>
                            {
                                filters.map((filter, index) =>
                                {
                                    const eventKeys = filterKeys;
                                    const eventVals = filter.eventKey ? keyToVals[filter.eventKey] : [];
                                    const onDelete = (): void => { deleteFilter(index); };
                                    const onKeyChange = (newKey: string): void => { updateFilter(index, 'eventKey', newKey); };
                                    const onValChange = (newVal: string): void => { updateFilter(index, 'eventVal', newVal); };

                                    return (
                                        <>
                                            { false && <button onClick={addFilter}>+</button> }
                                            { false && <button onClick={onDelete}>x</button> }
                                            {/* 1 */}
                                            <div className="text-right">Restrict:</div>
                                            {/* 2 */}
                                            <Select value={filters[index].eventKey || ''} onChange={(event) => {
                                                onKeyChange(event.target.value);
                                            }}>
                                                {
                                                    eventKeys.map((key) => <option key={key.id} value={key.id || ''}>{key.name}</option>)
                                                }
                                            </Select>
                                            {/* 3 */}
                                            <div>to</div>
                                            {/* 4 */}
                                            <Select disabled={!filters[index].eventKey} value={filters[index].eventVal || ''} onChange={(event) => {
                                                onValChange(event.target.value);
                                            }}>
                                                {
                                                    eventVals.map((val) => <option key={val.id} value={val.id || ''}>{val.name}</option>)
                                                }
                                            </Select>
                                        </>
                                    );
                                })
                            }
                        </h2>
                    </div>
                </div>
            </div>
            <div className="app-cards">
                {
                    chartSpecs.map(({
                        groupImageUrl,
                        items,
                        labelG,
                        labelX,
                        labelY,
                        maxY,
                        tickColor,
                    }, index) => <div key={index}>
                        <div className="grid grid-cols-1 items-center p-8 rounded-4xl m-8 mt-0 bg-zinc-300">
                            <div className="row-1 col-1 justify-self-center">
                                <div className="text-3xl font-bold"><b>{labelY}  ×  {labelX}</b></div>
                                <div className="text-3xl font-light"><div>{labelG || ' '}</div></div>
                            </div>
                            <div className="row-1 col-1 justify-self-end">
                                { groupImageUrl && <img className=" w-30 h-30" src={groupImageUrl}></img>}
                            </div>
                            <div className="row-2 col-1 h-[500px] text-xs">
                                <ChartElement items={items} maxY={maxY} tickColor={tickColor}></ChartElement>
                            </div>
                        </div>
                    </div>)
                }
            </div>
        </div>
    );
}

export default App;
