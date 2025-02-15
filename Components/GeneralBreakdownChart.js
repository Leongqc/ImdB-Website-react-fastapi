import React from 'react';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from 'react-query';
import { Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { useState } from 'react';

// Custom colors for each slice of the pie chart
const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
    '#AF19FF', '#FF4560', '#775DD0', '#546E7A',
    '#26a69a', '#D10CE8'
];

// Fetch genre data from the API
const fetchGenreData = async () => {
    const response = await fetch('http://127.0.0.1:8000/movies/genre-breakdown');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const GenreBreakdownChart = () => {
    const { data: genreData = [], isLoading, isError, error } = useQuery('genreData', fetchGenreData);

    const [activeIndex, setActiveIndex] = useState(-1); // Track which slice is hovered

    // Event handler for when a pie slice is hovered
    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    if (isLoading) {
        return (
            <Card sx={{ margin: 2, padding: 2, textAlign: 'center' }}>
                <CircularProgress />
            </Card>
        );
    }

    if (isError) {
        return (
            <Card sx={{ margin: 2, padding: 2, textAlign: 'center' }}>
                <Typography color="error">Error fetching data: {error.message}</Typography>
            </Card>
        );
    }

    // Format the tooltip to display better information
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '10px' }}>
                    <p>{`${payload[0].name} : ${payload[0].value} movies`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card sx={{ margin: 2 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Genre Breakdown
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={genreData.map(item => ({ name: item._id, value: item.count }))}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            label={({ name, value }) => `${name} (${value})`} // Add labels with movie counts
                            activeIndex={activeIndex}
                            activeShape={{ fill: COLORS[activeIndex % COLORS.length], radius: 110 }} // Hover effect to enlarge the active slice
                            onMouseEnter={onPieEnter}
                        >
                            {genreData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke={activeIndex === index ? '#000' : null} // Stroke effect on hover
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend layout="vertical" align="right" verticalAlign="middle" />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default GenreBreakdownChart;
