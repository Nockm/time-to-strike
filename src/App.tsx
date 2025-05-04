
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
import DynamicEventFilterElement from './DynamicEventFilter/DynamicEventFilterElement.tsx';
import * as eventTypeFilter from './EventTypeFilter/eventTypeFilter.tsx';
import * as metrics from './Metrics/metrics.tsx';

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

    return (
        <div className="app">
            <div className="app-header">
                <div className="app-header-left">⚽ TIME TO STRIKE </div>
                <div className="title debug-text">{new Date().toUTCString()} </div>
                <div className="app-header-right">Premier League Stats Seasons 2021 - 2024</div>
            </div>
            <div className="app-top">
                <div className="panel request">
                    <div>Comparing  </div>
                    <select value={filterYId} onChange={(event) => { setFilterYId(event.target.value); }}>
                        { eventFilters.map((eventFilter) => <option key={eventFilter.id} value={eventFilter.id}>{eventFilter.Plural}</option>) }
                    </select>
                    <div>  against  </div>
                    <select value={metricXId} onChange={(event) => { setMetricXId(event.target.value); }}>
                        { metrics.MetricXs.map((metric) => <option key={metric.id} value={metric.id}>{metric.Plural}</option>) }
                    </select>
                </div>
                <div className="panel-spacer"></div>
                <div className="panel filter">
                    <div>Split results into </div>
                    <select className="filter-select-group" value={metricGId} onChange={(event) => { setMetricGId(event.target.value); }}>
                        <option></option>
                        { metrics.MetricGs.map((metric) => <option key={metric.id} value={metric.id}>{metric.Plural}</option>) }
                    </select>
                    <div></div>
                    {
                        filters.map((filter, index) => <>
                            <DynamicEventFilterElement
                                key={index}
                                eventKeys={filterKeys}
                                eventVals={filter.eventKey ? keyToVals[filter.eventKey] : []}
                                filter={filters[index]}
                                onDelete={() => { deleteFilter(index); }}
                                onKeyChange={(newKey) => { updateFilter(index, 'eventKey', newKey); }}
                                onValChange={(newVal) => { updateFilter(index, 'eventVal', newVal); }}
                            ></DynamicEventFilterElement>
                        </>)
                    }
                </div>
            </div>
            <div className="app-mid">
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
                        <div className="panel card">
                            <div className="card-title">
                                <div className="card-title-1"><b>{labelY}  ×  {labelX}</b></div>
                                <div className="card-title-2"><div>{labelG}</div></div>
                            </div>
                            <img className="card-image" src={groupImageUrl}></img>
                            <div className="card-chart">
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
