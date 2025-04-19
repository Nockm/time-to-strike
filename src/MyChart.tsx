import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
    { 'name': 'Jan', 'value': 30 },
    { 'name': 'Feb', 'value': 45 },
    { 'name': 'Mar', 'value': 60 },
];

export default function MyChart () {
    return (
        <BarChart width={400} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
    );
}
