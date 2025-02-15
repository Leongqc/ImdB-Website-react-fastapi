// src/components/ProductionCountryChart.js

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useQuery } from 'react-query'; // Import useQuery from react-query
import { Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const fetchProductionCountry = async () => {
    const response = await fetch('http://127.0.0.1:8000/movies/production-country');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json(); // Parse the JSON response
};

const ProductionCountryChart = () => {
    // Use useQuery to fetch top movies data
    const { data: productionCountry, isLoading, isError, error } = useQuery('productionCountry', fetchProductionCountry);

    if (isLoading) {
        return (
            <Card sx={{ margin: 2, textAlign: 'center' }}>
                <CardContent>
                    <CircularProgress /> {/* Loading spinner */}
                </CardContent>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card sx={{ margin: 2, textAlign: 'center' }}>
                <CardContent>
                    <Typography variant="h6" color="error">
                        {error.message} {/* Display error message */}
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    // Prepare the data for the bar chart
    const chartData = {
        labels: productionCountry.map(country => country.name), // Assuming 'name' is the country field
        datasets: [
            {
                label: 'Number of Movies',
                data: productionCountry.map(country => country.movieCount), // Assuming 'movieCount' is the field for total movies
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            title: {
                display: true,
                text: 'Movies by Production Country',
            },
        },
        scales: {
            x: {
                beginAtZero: true,
            },
        },
    };

    return (
        <Card sx={{ margin: 2 }}>
            <CardContent>
                <Bar data={chartData} options={options} />
            </CardContent>
        </Card>
    );
};

export default ProductionCountryChart;
