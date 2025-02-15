import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Card, CardContent, Typography, CircularProgress } from '@mui/material';

// Register all necessary Chart.js components
Chart.register(...registerables);

// Function to fetch actor frequency data
const fetchActorFrequency = async () => {
    const { data } = await axios.get('http://127.0.0.1:8000/movies/actors/frequency');

    // Transform the data for the chart
    if (data && Array.isArray(data)) {
        const transformedData = data.map(item => ({
            actor: item._id.actor,
            genre: item._id.genre,
            count: item.count
        }));

        // Sort data by count (descending)
        transformedData.sort((a, b) => b.count - a.count);

        return {
            labels: transformedData.map(item => `${item.actor} (${item.genre})`),
            datasets: [{
                label: 'Number of Appearances',
                data: transformedData.map(item => item.count),
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 1,
            }]
        };
    } else {
        throw new Error("Unexpected response data structure");
    }
};

const ActorFrequency = () => {
    // Use React Query to fetch data with caching
    const { data, error, isLoading } = useQuery('actorFrequency', fetchActorFrequency, {
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 10, // Cache for 10 minutes
        refetchOnWindowFocus: false // Do not refetch on window focus
    });

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return <div>{error.message}</div>;
    }

    return (
        <Card variant="outlined" style={{ margin: '20px', padding: '20px' }}>
            <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                    Actor Frequency by Genre
                </Typography>
                <Bar
                    data={data}
                    options={{
                        scales: {
                            x: { title: { display: true, text: 'Actors (Genres)' } },
                            y: { title: { display: true, text: 'Appearances' } },
                        },
                    }}
                />
            </CardContent>
        </Card>
    );
};

export default ActorFrequency;
