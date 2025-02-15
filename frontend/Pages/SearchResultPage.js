import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, Typography, Grid, Button, Checkbox, IconButton, CircularProgress } from '@mui/material';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility'; // Icon for "View Movie"

const ResultsPage = () => {
    const location = useLocation();
    const [movies, setMovies] = useState([]);
    const [searchParams] = useSearchParams();
    const [results, setResults] = useState([]);
    const navigate = useNavigate();
    const [selectedMovies, setSelectedMovies] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const parseQueryString = (queryString) => {
        const params = new URLSearchParams(queryString);
        return {
            category: params.get('category'),
            searchTerm: params.get('searchTerm'),
            genres: params.get('genres') ? params.get('genres').split(',') : [],
            ratingRange: params.get('ratingRange') ? params.get('ratingRange').split(',') : [],
            yearRange: params.get('yearRange') ? params.get('yearRange').split(',') : [],
        };
    };

    useEffect(() => {
        const { category, searchTerm, genres, ratingRange, yearRange } = parseQueryString(location.search);

        // Construct the Axios URL with all query parameters
        const queryParams = new URLSearchParams();
        if (category) queryParams.append('category', category);
        if (searchTerm) queryParams.append('searchTerm', searchTerm);
        if (genres.length > 0) queryParams.append('genres', genres.join(','));
        if (ratingRange.length > 0) queryParams.append('ratingRange', ratingRange.join(','));
        if (yearRange.length > 0) queryParams.append('yearRange', yearRange.join(','));

        const axiosUrl = `http://127.0.0.1:8000/movie/search?${queryParams.toString()}`;

        // Fetch movies from the backend
        const fetchMovies = async () => {
            try {
                const response = await axios.get(axiosUrl);
                setResults(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching movies:', error);
                setLoading(false);
            }
        };

        fetchMovies();


    }, [location.search]);

    const handleSelect = (movieId) => {
        const updatedSelection = selectedMovies.includes(movieId)
            ? selectedMovies.filter(id => id !== movieId)
            : [...selectedMovies, movieId];

        setSelectedMovies(updatedSelection);
    };

    const handleCompare = () => {
        navigate('/movie-compare', { state: { selectedMovies } });
    };

    const handleViewMovie = (movieId) => {
        navigate(`/movies/${movieId}`); // Navigates to the movie detail page
    };

    if (loading) return <CircularProgress />; // Show loading spinner if loading

    if (!results) return <Typography>No movie details found.</Typography>; // Handle case if movie is not found

    return (
        <Card sx={{ margin: 2, padding: 2 }}>
            <CardContent>
                <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />}>
                    Back
                </Button>
                <Button
                    onClick={handleCompare}
                    disabled={selectedMovies.length < 2 || selectedMovies.length > 2}
                    variant="contained"
                    color="primary"
                    sx={{ marginTop: 2 , marginBottom: 2}}
                >
                    Compare Selected Movies
                </Button>
                <Typography variant="h4" gutterBottom>Search Results</Typography>
                <Grid container spacing={2}>
                    {results.length > 0 ? (
                        results.map((movie) => (
                            <Grid item xs={12} md={6} key={movie.id}>
                                <Card>
                                    <CardContent>
                                        <Grid container justifyContent="space-between" alignItems="center">
                                            <Checkbox
                                                checked={selectedMovies.includes(movie.id)}
                                                onChange={() => handleSelect(movie.id)}
                                            />
                                            <Button
                                                onClick={() => handleViewMovie(movie.id)}
                                                variant="contained"
                                                color="primary"
                                                sx={{ marginTop: 2 }}
                                            >
                                                View Movie Details
                                            </Button>
                                        </Grid>
                                        <Typography variant="h6">{movie.title}</Typography>
                                        <Typography variant="body2">{movie.overview}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Typography>No results found</Typography>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default ResultsPage;
