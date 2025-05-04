import './App.css';
import * as counters from '../data/util/counters.ts';
import type { Metric } from './Metrics/metric.tsx';
import type * as chart from './Chart/chart.tsx';
import type * as Db from '../data/db/dbTypes.ts';
import type { EventTypeFilter } from './EventTypeFilter/eventTypeFilter.tsx';
import type { ChartElementProps } from './Chart/ChartElement.tsx';

export type ChartSpec = ChartElementProps & {
    'labelX': string;
    'labelY': string;
    'labelG': string;
    'groupName'?: string;
    'groupImageUrl'?: string;
};

const root = document.documentElement;

/* eslint-disable @stylistic/js/newline-per-chained-call */
const cardBar1 = getComputedStyle(root).getPropertyValue('--color-card-bar1').trim();
const cardBar2 = getComputedStyle(root).getPropertyValue('--color-card-bar2').trim();
const cardTickColor = getComputedStyle(root).getPropertyValue('--color-card-fore').trim();
/* eslint-enable @stylistic/js/newline-per-chained-call */

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
        ? cardBar2
        : cardBar1;

    return {
        fill,
        'tooltipHeader': `${yvalue} ${state.filterY.plural} at ${metricX.singular} ${xvalueformatted}`,
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
        'tickColor': cardTickColor,
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
