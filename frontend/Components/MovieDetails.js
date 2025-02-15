import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Grid, Button, CircularProgress } from '@mui/material';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const MovieDetails = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [token, setToken] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [successMessageClass, setSuccessMessageClass] = useState('');

    useEffect(() => {
        axios.get(`http://127.0.0.1:8000/movies/${id}`)
            .then(response => {
                setMovie(response.data);
            })
            .catch(error => console.error(error))
            .finally(() => setLoading(false));

        const storedToken = localStorage.getItem('token');
        setToken(storedToken);

        // If the token exists, record the searched movie
        if (storedToken) {
            axios.post(
                `http://127.0.0.1:8000/movie/save-searched-movie`,
                { movie_id: id },
                {
                    headers: { Authorization: `Bearer ${storedToken}` },
                }
            )
                .then(response => {
                    console.log('Searched movie saved successfully');
                })
                .catch(error => {
                    console.error('Error saving searched movie:', error);
                });
        }
    }, [id]);

    const handleSaveAsFavorite = () => {
        if (!token) return;

        axios.post(`http://127.0.0.1:8000/movie/save-fav-movie`, { movie_id: id }, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setSuccessMessage('Favorite Movie updated successfully!');
                setSuccessMessageClass('show');
                setTimeout(() => {
                    setSuccessMessage('');
                    setSuccessMessageClass('');
                }, 3000);
            })
            .catch(error => {
                console.error('Error saving favorite movie:', error);
            });
    };

    if (loading) return <CircularProgress />;
    if (!movie) return <Typography>No movie details found.</Typography>;

    // Define data for charts
    const ratingData = [
        { name: "Average Rating", value: parseFloat(movie.AverageRating.toFixed(2)) },
        { name: "Remaining", value: parseFloat((10 - movie.AverageRating).toFixed(2)) } // Assuming 10 as max rating
    ];

    const popularityData = [
        { name: "Popularity", value: parseFloat(movie.popularity.toFixed(2)) },
        { name: "Remaining", value: parseFloat((100 - movie.popularity).toFixed(2)) } // Assuming 100 as max popularity
    ];

    const COLORS = ["#8884d8", "#d0d0d0"]; // Main color and background

    return (
        <Card sx={{ margin: 2, padding: 2 }}>
            <CardContent>
                <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />}>
                    Back
                </Button>
                <Typography variant="h4" gutterBottom>{movie.title}</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                        <Typography variant="subtitle1"><strong>Overview:</strong> {movie.overview}</Typography>
                        <Typography variant="subtitle1"><strong>Production Country:</strong> {movie.production_countries.join(', ')}</Typography>
                        <Typography variant="subtitle1"><strong>Spoken Language:</strong> {movie.spoken_languages.join(', ')}</Typography>
                        <Typography variant="subtitle1"><strong>Genres:</strong> {movie.genres_list.join(', ')}</Typography>
                        <Typography variant="subtitle1"><strong>Release Date:</strong> {movie.release_date}</Typography>
                    </Grid>

                    {/* Pie Charts */}
                    <Grid item xs={12} md={4}>
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

                {token && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveAsFavorite}
                        sx={{ marginTop: 2 }}
                    >
                        Save as Favourite Movie
                    </Button>
                )}
                {successMessage && (
                    <div className={`filter-box ${successMessageClass}`}>
                        {successMessage}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default MovieDetails;
