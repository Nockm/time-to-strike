import type { JSX } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import type { TooltipProps } from 'recharts'; // eslint-disable-line no-duplicate-imports

export interface ChartItem {
    'fill': string;
    'summaries': string[];
    'xlabel': string;
    'yvalue': number;
}

export interface ChartSpec {
    'title': string;
    'items': ChartItem[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>): JSX.Element | null => {
    if (active && payload?.length) {
        const thing = payload[0].payload;
        return (
            <div style={{
                'backgroundColor': 'white',
                'border': '1px solid black',
                'color': 'black',
                'padding': '10px',
            }}>
                <div style={{ 'fontWeight': 'bold' }}>{thing.value} {label} goals scored at '{thing.key}</div>
                {
                    thing.summaries.map((summary: string, index: number) => <div key={index}>{summary}</div>)
                }
            </div>
        );
    }

    return null;
};

export default function MyChart ({ chartSpec }: { 'chartSpec': ChartSpec }): JSX.Element {
    return (
        <>
            <BarChart width={2500} height={400} data={chartSpec.items}>
                <XAxis dataKey="xlabel" angle={90} interval={4} textAnchor="start" height={50} />
                <YAxis />
                <Tooltip content={CustomTooltip} />
                <Bar dataKey="yvalue" fill="#8884d8" />
            </BarChart>
        </>
    );
}
