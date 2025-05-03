/* eslint-disable sort-keys */

import './App.css';
import * as counters from '../data/util/counters.ts';
import type { Metric } from './Metrics/metric.tsx';
import type * as chart from './Chart/chart.tsx';
import type * as Db from '../data/db/dbTypes.ts';
import type * as TChart from './Chart/ChartElement.tsx';
import type { EventFilter } from './EventFilter/eventFilterUtil.tsx';

const root = document.documentElement;

const cardBar1 = getComputedStyle(root).getPropertyValue('--card-bar1')
    .trim();
const cardBar2 = getComputedStyle(root).getPropertyValue('--card-bar2')
    .trim();

export interface State {
    'eventFilter': EventFilter;
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
        'groupName': groupName || '',
        'groupImageUrl': groupImageUrl || '',
        'items': chartItems,
    };
}

export function getChartSpecs (state: State, dbEvents: Db.Event[]): TChart.Spec[] {
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
