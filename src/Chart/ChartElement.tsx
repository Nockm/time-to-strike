import type { JSX } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import type { TooltipProps } from 'recharts'; // eslint-disable-line no-duplicate-imports
import type { Item } from './chart';

const root = document.documentElement;
const cardTickColor = getComputedStyle(root).getPropertyValue('--card-tick-color')
    .trim();

export interface Spec {
    'items': Item[];
    'maxY'?: number;
    'labelx': string;
    'labely': string;
    'labelg': string;
    'groupName'?: string;
    'groupImageUrl'?: string;
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>): JSX.Element | null => {
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

export default function Chart ({ spec }: { 'spec': Spec }): JSX.Element {
    // eslint-disable-next-line no-undefined
    const domain = spec.maxY ? [0, spec.maxY] : undefined;

    return (
        <>
            <ResponsiveContainer>
                <BarChart data={spec.items}>
                    <XAxis dataKey="xvalueformatted" stroke={cardTickColor} tick angle={90} interval={0} textAnchor="start" height={120} />
                    <YAxis domain={domain} />
                    <Tooltip content={CustomTooltip} />
                    <Bar dataKey="yvalue" />
                </BarChart>
            </ResponsiveContainer>
        </>
    );
}
