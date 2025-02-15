// src/components/RatingsDistribution.js

import React from 'react';
import { Bar } from 'react-chartjs-2'; // Assuming you're using Chart.js
import { useQuery } from 'react-query'; // Import useQuery from react-query
import { Card, CardContent, Typography, CircularProgress } from '@mui/material';

const fetchRatingsDistribution = async () => {
    const response = await fetch('http://localhost:8000/movies/ratings/distribution');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json(); // Parse the JSON response
};

const RatingsDistribution = () => {
    // Use useQuery to fetch ratings distribution data
    const { data, isLoading, isError, error } = useQuery('ratingsDistribution', fetchRatingsDistribution);

    // Prepare data for Chart.js
    const chartData = {
        labels: data ? data.map(item => item._id) : [], // Genres
        datasets: [
            {
                label: 'Highest Average Rating',
                data: data ? data.map(item => item.highest_rating) : [], // Highest average ratings
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    };

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
                <Typography color="error">Error fetching ratings distribution: {error.message}</Typography>
            </div>
        );
    }

    return (
        <Card variant="outlined" style={{ margin: '20px', padding: '20px' }}>
            <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                    Highest Average Ratings by Genre
                </Typography>
                <Bar data={chartData} options={{ responsive: true }} />
            </CardContent>
        </Card>
    );
};

export default RatingsDistribution;
