
import './App.css';
import { useState } from 'react';
import type { JSX } from 'react';
import * as counters from '../data/util/counters.ts';
import * as metrics from './Metrics/metrics.tsx';
import type * as Db from '../data/db/dbTypes.ts';
import * as TMetricFilter from './MetricFilter/MetricFilterElement.tsx';
import * as MetricFilterUtil from './MetricFilter/MetricFilterUtil.tsx';
import Chart from './Chart/ChartElement.tsx';
import dbJsonCompressed from '../data/output/db.dat?raw';
import * as b64ZipUtil from '../data/util/stringCompressionUtil.ts';
import MetricFilter from './MetricFilter/MetricFilterElement.tsx';
import { eventFilterAccept, getEventFilters } from './EventFilter/eventFilterUtil.tsx';
import type { EventFilter } from './EventFilter/eventFilterUtil.tsx';
import { getChartSpecs, type State } from './chartSpecUtil.ts';

// Decompress and parse the database.
const dbJson: string = b64ZipUtil.decompressString(dbJsonCompressed);
const db: Db.Root = JSON.parse(dbJson);

// Get metrics.
const filterKeys: TMetricFilter.SelectableKey[] = MetricFilterUtil.getFilterKeys();

// Get events.
const eventFilters: EventFilter[] = getEventFilters();

const keyToVals: Record<string, TMetricFilter.SelectableVal[]> = MetricFilterUtil.getKeyToVals(db.events);

function App (): JSX.Element {
    const [selectedMetricXId, setSelectedMetricXId] = useState<string>(metrics.MetricXs[0].id);
    const [selectedFilterYId, setSelectedFilterYId] = useState<string>(eventFilters[0].id);
    const [selectedMetricGId, setSelectedMetricGId] = useState<string>();
    const [filters, setFilters] = useState<TMetricFilter.Selected[]>([{ 'key': null, 'val': '...' }]);

    const addFilter = (): void => {
        setFilters((prev) => prev.concat([{ 'key': null, 'val': '...' }]));
    };

    const deleteFilter = (index: number): void => {
        setFilters((prev) => prev.filter((_, i) => i !== index));
    };

    const updateFilter = (index: number, field: 'key' | 'val', newValue: string): void => {
        setFilters((prev) => prev.map((filter, filterIndex) => filterIndex === index ? { ...filter, [field]: newValue } : filter));
    };

    const selectedMetricX = metrics.MetricXs.find((item) => item.id === selectedMetricXId);
    if (!selectedMetricX) {
        return <div>Invalid selected key</div>;
    }

    const selectedMetricG = metrics.MetricGs.find((item) => item.id === selectedMetricGId);

    let events: Db.Event[] = MetricFilterUtil.filterEvents(db.events, filters);

    const selectedEventFilter = eventFilters.find((x) => x.id === selectedFilterYId);

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
                                const vals = filter.key ? keyToVals[filter.key] : [];

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
