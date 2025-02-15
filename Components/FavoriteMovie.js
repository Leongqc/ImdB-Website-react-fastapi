import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, CircularProgress, Grid } from '@mui/material';
import axios from 'axios';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const FavoriteMovie = () => {
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    useEffect(() => {
        const fetchFavoriteMovieId = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/movie/favmovie`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const favoriteMovieId = parseInt(response.data.movie_id, 10);
                fetchMovieDetail(favoriteMovieId);
            } catch (error) {
                console.error('Error fetching favorite movie ID:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchMovieDetail = async (id) => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/movies/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMovie(response.data);
            } catch (error) {
                console.error('Error fetching movie details:', error);
            }
        };

        fetchFavoriteMovieId();
    }, [token]);

    if (loading) {
        return <CircularProgress />;
    }

    // Check if movie data is available
    if (!movie) {
        return (
            <Card sx={{ margin: 2, padding: 2, width: '100%', minHeight: '80px' }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Your Favourite Movie</Typography>
                    <Typography variant="h4" align="center">No Favourite Movie Found</Typography>
                </CardContent>
            </Card>
        );
    }

    // Define data for charts after confirming movie data is available
    const ratingData = [
        { name: "Average Rating", value: parseFloat(movie.AverageRating.toFixed(2)) },
        { name: "Remaining", value: parseFloat((10 - movie.AverageRating).toFixed(2)) }
    ];

    const popularityData = [
        { name: "Popularity", value: parseFloat(movie.popularity.toFixed(2)) },
        { name: "Remaining", value: parseFloat((100 - movie.popularity).toFixed(2)) }
    ];

    const COLORS = ["#8884d8", "#d0d0d0"];

    return (
        <Card sx={{ margin: 2, padding: 2, width: '100%' }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>Your Favourite Movie</Typography>
                <Typography variant="h4" gutterBottom>{movie.title}</Typography>
                <Typography variant="subtitle1"><strong>Overview:</strong> {movie.overview}</Typography>
                <Typography variant="subtitle1"><strong>Genres:</strong> {movie.genres_list.join(', ')}</Typography>
                <Typography variant="subtitle1"><strong>Release Date:</strong> {movie.release_date}</Typography>

                {/* Pie Charts - Side by Side */}
                <Grid container spacing={4} sx={{ marginTop: 2 }}>
                    <Grid item xs={12} md={6}>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={ratingData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={70}
                                    innerRadius={50}
                                    startAngle={90}
                                    endAngle={-270}
                                    fill="#8884d8"
                                >
                                    {ratingData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => `${name}: ${value}`} />
                            </PieChart>
                        </ResponsiveContainer>
                        <Typography align="center">Average Rating: {movie.AverageRating.toFixed(2)}</Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={popularityData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={70}
                                    innerRadius={50}
                                    startAngle={90}
                                    endAngle={-270}
                                    fill="#82ca9d"
                                >
                                    {popularityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => `${name}: ${value}`} />
                            </PieChart>
                        </ResponsiveContainer>
                        <Typography align="center">Popularity: {movie.popularity.toFixed(2)}</Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default FavoriteMovie;
