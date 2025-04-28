import type { JSX } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import type { TooltipProps } from 'recharts'; // eslint-disable-line no-duplicate-imports
import type { Item } from './chart';

export interface Spec {
    'title': string;
    'items': Item[];
    'maxY'?: number;
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

            <div style={{ 'height': 400, 'width': '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart width={2500} height={400} data={spec.items}>
                        <XAxis dataKey="xvalueformatted" angle={90} interval={0} textAnchor="start" height={150} />
                        <YAxis domain={domain} />
                        <Tooltip content={CustomTooltip} />
                        <Bar dataKey="yvalue" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </>
    );
}
