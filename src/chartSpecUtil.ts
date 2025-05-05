import './App.css';
import * as counters from '../data/util/counters.ts';
import type { Metric } from './Metrics/metric.tsx';
import type * as chart from './Chart/chart.tsx';
import type * as Db from '../data/db/dbTypes.ts';
import type { EventTypeFilter } from './EventTypeFilter/eventTypeFilter.tsx';
import type { ChartElementProps } from './Chart/ChartElement.tsx';
import { quantLower } from '../data/util/wordUtil.ts';

export type ChartSpec = ChartElementProps & {
    'labelX': string;
    'labelY': string;
    'labelG': string;
    'groupName'?: string;
    'groupImageUrl'?: string;
};

export interface State {
    'filterY': EventTypeFilter;
    'metricX': Metric;
    'metricG'?: Metric;
}

function getChartItem (state: State, xvalue: string, events: Db.Event[]): chart.Item {
    const { metricX } = state;
    const yvalue = events.length;
    const xvalueformatted = metricX.formatter
        ? metricX.formatter(xvalue)
        : xvalue;

    const fill = xvalueformatted.includes('+')
        ? 'red'
        : '#333';

    return {
        fill,
        'tooltipHeader': `${yvalue} ${quantLower(state.filterY, yvalue)} at ${metricX.singular} ${xvalueformatted}`,
        'tooltipLines': events.sort((item1, item2) => item1.f_fixture_id - item2.f_fixture_id).map((event) => event.c_summary),
        xvalue,
        xvalueformatted,
        yvalue,
    };
}

function getChartSpec (state: State, dbEvents: Db.Event[], groupName: string): ChartSpec {
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
        'tickColor': '',
        'labelX': state.metricX.Plural,
        'labelY': state.filterY.Plural,
        'labelG': groupName,
        'groupName': groupName || '',
        'groupImageUrl': groupImageUrl || '',
        'items': chartItems,
        'maxY': 0,
    };
}

export function getChartSpecs (state: State, dbEvents: Db.Event[]): ChartSpec[] {
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
