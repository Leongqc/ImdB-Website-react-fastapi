import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Button, CircularProgress, Grid } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import '../App.css';

const MAX_RECOMMENDATIONS = 5;

const MovieRecommendations = () => {
    const [searchedMovies, setSearchedMovies] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isFading, setIsFading] = useState(false);
    const [fadeDirection, setFadeDirection] = useState('next'); // To track direction for animation
    const [token] = useState(localStorage.getItem('token') || null);
    const navigate = useNavigate();

    const handleViewMovie = (movieId) => {
        navigate(`/movies/${movieId}`); // Navigates to the movie detail page
    };

    useEffect(() => {
        const fetchSearchedMovies = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/movie/searched', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const movieIds = response.data.searchedMovie || [];
                if (movieIds.length > 0) {
                    const movieDetails = await Promise.all(
                        movieIds.slice(0, MAX_RECOMMENDATIONS).map(async (id) => {
                            const movieResponse = await axios.get(`http://127.0.0.1:8000/movies/${id}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            return movieResponse.data;
                        })
                    );
                    setSearchedMovies(movieDetails);
                }
            } catch (error) {
                console.error('Error fetching searched movies:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchedMovies();
    }, [token]);

    useEffect(() => {
        const interval = setInterval(() => {
            handleNext();
        }, 3000);
        return () => clearInterval(interval);
    }, [currentIndex, searchedMovies]);

    const handleNext = () => {
        setIsFading(true);
        setFadeDirection('next');
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % searchedMovies.length);
            setIsFading(false);
        }, 500); // Adjust the timing to match the fade-out effect
    };

    const handlePrevious = () => {
        setIsFading(true);
        setFadeDirection('prev');
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + searchedMovies.length) % searchedMovies.length);
            setIsFading(false);
        }, 500);
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (searchedMovies.length === 0) {
        return (
            <Card sx={{ margin: 2, padding: 2, width: "100%" }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>The Movie You Might Like</Typography>
                    <Typography variant="h4" align="center">No Recommendations Found</Typography>
                </CardContent>
            </Card>
        );
    }

    const currentMovie = searchedMovies[currentIndex];

    return (
        <Card sx={{ margin: 2, padding: 2, width: "100%" }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>The Movie You Might Like</Typography>

                <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={1}>
                        <Button onClick={handlePrevious}>
                            <ArrowBackIosIcon />
                        </Button>
                    </Grid>
                    <Grid item xs={10}>
                        <div className={`movie-holder ${isFading ? (fadeDirection === 'next' ? 'fade-out-right' : 'fade-out-left') : (fadeDirection === 'next' ? 'fade-in-right' : 'fade-in-left')}`}>
                            <Typography variant="h4">{currentMovie.title}</Typography>
                            <Typography variant="subtitle1">Average Rating: {currentMovie.AverageRating.toFixed(2)}</Typography>
                            <Typography variant="subtitle1">Popularity: {currentMovie.popularity.toFixed(2)}</Typography>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => handleViewMovie(currentMovie.id)} // Call handleViewMovie with movie ID
                                sx={{ marginTop: 2, float: 'right' }}
                            >
                                View Movie Details
                            </Button>
                        </div>
                    </Grid>
                    <Grid item xs={1}>
                        <Button onClick={handleNext}>
                            <ArrowForwardIosIcon />
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default MovieRecommendations;
