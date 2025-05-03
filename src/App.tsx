
import './App.css';
import { useState } from 'react';
import type { JSX } from 'react';
import * as counters from '../data/util/counters.ts';
import * as metrics from './Metrics/metrics.tsx';
import type * as Db from '../data/db/dbTypes.ts';
import * as eventTypeFilter from './EventTypeFilter/eventTypeFilter.tsx';
import * as dynamicEventFilter from './DynamicEventFilter/dynamicEventFilter.tsx';
import DynamicEventFilterElement from './DynamicEventFilter/DynamicEventFilterElement.tsx';
import Chart from './Chart/ChartElement.tsx';
import dbJsonCompressed from '../data/output/db.dat?raw';
import * as b64ZipUtil from '../data/util/stringCompressionUtil.ts';
import { getChartSpecs, type State } from './chartSpecUtil.ts';

// Decompress and parse the database.
const dbJson: string = b64ZipUtil.decompressString(dbJsonCompressed);
const db: Db.Root = JSON.parse(dbJson);

// Get metrics.
const filterKeys: dynamicEventFilter.EventKey[] = dynamicEventFilter.getFilterEventKeys();

// Get events.
const eventFilters: eventTypeFilter.EventTypeFilter[] = eventTypeFilter.getEventTypeFilters();

const keyToVals: Record<string, dynamicEventFilter.EventVal[]> = dynamicEventFilter.getEventKeyToValsLut(db.events);

function App (): JSX.Element {
    const [selectedMetricXId, setSelectedMetricXId] = useState<string>(metrics.MetricXs[0].id);
    const [selectedFilterYId, setSelectedFilterYId] = useState<string>(eventFilters[0].id);
    const [selectedMetricGId, setSelectedMetricGId] = useState<string>();
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

    const selectedMetricX = metrics.MetricXs.find((item) => item.id === selectedMetricXId);
    if (!selectedMetricX) {
        return <div>Invalid selected key</div>;
    }

    const selectedMetricG = metrics.MetricGs.find((item) => item.id === selectedMetricGId);

    let events: Db.Event[] = dynamicEventFilter.filterEvents(db.events, filters);

    const selectedEventFilter = eventFilters.find((x) => x.id === selectedFilterYId);

    if (!selectedEventFilter) {
        return <div>Invalid selected filter</div>;
    }
    if (selectedEventFilter) {
        events = events.filter((event) => eventTypeFilter.filterEvent(event, selectedEventFilter));
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
                        <div className="request-key">Show how </div>
                        <select value={selectedFilterYId} onChange={(event) => { setSelectedFilterYId(event.target.value); }} >
                            {
                                eventFilters.map((eventFilter) => <option key={eventFilter.id} value={eventFilter.id}>{eventFilter.Plural}</option>)
                            }
                        </select>
                        <div className="request-key"> change with </div>
                        <select value={selectedMetricXId} onChange={(event) => { setSelectedMetricXId(event.target.value); }} >
                            {
                                metrics.MetricXs.map((metric) => <option key={metric.id} value={metric.id}>{metric.Plural}</option>)
                            }
                        </select>
                        <div className="request-key"> for each </div>
                        <select value={selectedMetricGId} onChange={(event) => { setSelectedMetricGId(event.target.value); }}>
                            <option></option>
                            {
                                metrics.MetricGs.map((metric) => <option key={metric.id} value={metric.id}>{metric.Singular}</option>)
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
                                const vals = filter.eventKey ? keyToVals[filter.eventKey] : [];

                                return <DynamicEventFilterElement
                                    key={index}
                                    eventKeys={filterKeys}
                                    eventVals={vals}
                                    filter={filters[index]}
                                    onDelete={() => {
                                        deleteFilter(index);
                                    }}
                                    onKeyChange={(newKey) => {
                                        updateFilter(index, 'eventKey', newKey);
                                    }}
                                    onValChange={(newVal) => {
                                        updateFilter(index, 'eventVal', newVal);
                                    }}
                                ></DynamicEventFilterElement>;
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
