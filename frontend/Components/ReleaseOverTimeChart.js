import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useQuery } from 'react-query';
import { Card, CardContent, Typography, CircularProgress } from '@mui/material';

const fetchRevenueAndCountOverTime = async () => {
    const response = await fetch('http://127.0.0.1:8000/movies/releases-over-time'); // Use the combined endpoint
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json(); // Parse the JSON response
};

const RevenueOverTimeChart = () => {
    const { data, isLoading, isError, error } = useQuery('revenueAndCountOverTime', fetchRevenueAndCountOverTime);

    // Prepare data for the chart
    const revenueData = data ? data.map(item => ({ year: item._id, revenue: item.revenue, releases: item.count })) : [];

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </div>
        );
    }

    if (isError) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography color="error">Error fetching revenue over time: {error.message}</Typography>
            </div>
        );
    }

    // Custom tooltip to show revenue and releases
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '10px' }}>
                    <p>{`Year: ${payload[0].payload.year}`}</p>
                    <p>{`Revenue: $${payload[0].value.toLocaleString()}`}</p>
                    <p>{`Releases: ${payload[1].value}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card sx={{ margin: 2 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Movie Revenue and Releases Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />

                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} dot={{ stroke: '#82ca9d', strokeWidth: 2 }} />
                        <Line type="monotone" dataKey="releases" stroke="#FF5733" strokeWidth={2} dot={{ stroke: '#FF5733', strokeWidth: 2 }} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default RevenueOverTimeChart;
