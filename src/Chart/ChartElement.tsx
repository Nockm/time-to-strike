import type { JSX } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import type { TooltipProps } from 'recharts';
import type { Item } from './chart';

export interface ChartElementProps {
    'items': Item[];
    'maxY': number;
    'tickColor': string;
}

const ItemTooltip = ({ active, payload }: TooltipProps<number, string>): JSX.Element | null => {
    if (active && payload?.length) {
        const item: Item = payload[0].payload;
        return (
            <div className="tooltip">
                <div className="tooltip-header">{item.tooltipHeader}</div>
                {
                    item.tooltipLines.map((line: string, index: number) => <div key={index}>{line}</div>)
                }
            </div>
        );
    }

    return null;
};

export default function ChartElement ({
    items,
    maxY,
    tickColor,
}: ChartElementProps): JSX.Element {
    const domain = maxY ? [0, maxY] : undefined; // eslint-disable-line no-undefined

    return (
        <>
            <ResponsiveContainer>
                <BarChart data={items}>
                    <XAxis dataKey="xvalueformatted" stroke={tickColor} tick angle={90} interval={0} textAnchor="start" height={120} />
                    <YAxis domain={domain} stroke={tickColor} />
                    <Tooltip content={ItemTooltip} />
                    <Bar dataKey="yvalue" />
                </BarChart>
            </ResponsiveContainer>
        </>
    );
}
