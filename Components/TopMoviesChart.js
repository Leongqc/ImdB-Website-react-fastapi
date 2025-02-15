// src/components/TopMoviesChart.js

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useQuery } from 'react-query';
import { Card, CardContent, Typography, CircularProgress, Select, MenuItem } from '@mui/material';

const fetchTopMovies = async (filter) => {
    const response = await fetch(`http://127.0.0.1:8000/movies/top-rated?filter=${filter}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const TopMoviesChart = () => {
    const [filter, setFilter] = useState('highest-rated'); // Default filter

    // Fetch data based on the selected filter
    const { data: topMovies, isLoading, isError, error } = useQuery(['topMovies', filter], () => fetchTopMovies(filter));

    const handleFilterChange = (event) => {
        setFilter(event.target.value); // Update filter and refetch data
    };

    if (isLoading) {
        return (
            <Card sx={{ margin: 2, textAlign: 'center' }}>
                <CardContent>
                    <CircularProgress />
                </CardContent>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card sx={{ margin: 2, textAlign: 'center' }}>
                <CardContent>
                    <Typography variant="h6" color="error">
                        {error.message}
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ margin: 2 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Top 10 Movies by {filter.replace('-', ' ')}
                </Typography>
                <Select
                    value={filter}
                    onChange={handleFilterChange}
                    sx={{ marginBottom: 2 }}
                    variant="outlined"
                >
                    <MenuItem value="highest-rated">Highest Rating</MenuItem>
                    <MenuItem value="popularity">Most Popular</MenuItem>
                    <MenuItem value="Documentary">By Documentary (Genre)</MenuItem>
                    <MenuItem value="Drama">By Drama (Genre)</MenuItem>
                    <MenuItem value="Comedy">By Comedy (Genre)</MenuItem>
                    <MenuItem value="Horror">By Horror (Genre)</MenuItem>
                    <MenuItem value="Thriller">By Thriller (Genre)</MenuItem>
                    <MenuItem value="Animation">By Animation (Genre)</MenuItem>
                    <MenuItem value="Music">By Music (Genre)</MenuItem>
                    <MenuItem value="Action">By Action (Genre)</MenuItem>
                    <MenuItem value="Romance">By Romance (Genre)</MenuItem>
                    <MenuItem value="Science Fiction">By Science Fiction (Genre)</MenuItem>
                    <MenuItem value="Crime">By Crime (Genre)</MenuItem>
                    <MenuItem value="TV Movie">By TV Movie (Genre)</MenuItem>
                    <MenuItem value="Mystery">By Mystery (Genre)</MenuItem>
                    <MenuItem value="Fantasy">By Fantasy (Genre)</MenuItem>
                    <MenuItem value="Family">By Family (Genre)</MenuItem>
                    <MenuItem value="Adventure">By Adventure (Genre)</MenuItem>
                    <MenuItem value="History">By History (Genre)</MenuItem>
                </Select>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topMovies} layout="vertical" margin={{ top: 20, right: 50, left: 50, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 10]} />
                        <YAxis
                            type="category"
                            dataKey="title"
                            tick={{ fontSize: 15 }}
                        />
                        <Tooltip />
                        <Bar dataKey={filter === 'popularity' ? 'popularity' : 'AverageRating'} fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default TopMoviesChart;
