import React, { useState } from 'react';
import {Grid, Card, CardContent, Typography, CircularProgress, Tooltip } from '@mui/material';
import { useQuery } from 'react-query';
import axios from 'axios';

// Fetch functions
const fetchTotalMovies = async () => {
    const { data } = await axios.get('http://127.0.0.1:8000/movies?limit=0');
    return data.length;
};

const fetchTopRatedMovie = async () => {
    const { data } = await axios.get('http://127.0.0.1:8000/movies/top-rated');
    return data[0] || {};
};

const fetchMostFrequentGenre = async () => {
    const { data } = await axios.get('http://127.0.0.1:8000/movies/genre-breakdown');
    return data[0]?._id || 'N/A';
};

const fetchMostPopularMovie = async () => {
    const { data } = await axios.get('http://127.0.0.1:8000/movies/most-popular');
    return data[0] || {};
};

const fetchAverageRuntime = async () => {
    const { data } = await axios.get('http://127.0.0.1:8000/movies');
    const runtimes = data.map(movie => movie.runtime).filter(rt => rt !== null);
    const avgRuntime = runtimes.reduce((a, b) => a + b, 0) / runtimes.length;
    return avgRuntime.toFixed(2);
};

const fetchUniqueLanguages = async () => {
    const { data } = await axios.get('http://127.0.0.1:8000/movies/unique-languages');
    return data;
};

const KpiCards = () => {
    const { data: totalMovies, isLoading: loadingTotalMovies } = useQuery('totalMovies', fetchTotalMovies);
    const { data: topRatedMovie, isLoading: loadingTopRatedMovie } = useQuery('topRatedMovie', fetchTopRatedMovie);
    const { data: mostFrequentGenre, isLoading: loadingMostFrequentGenre } = useQuery('mostFrequentGenre', fetchMostFrequentGenre);
    const { data: averageRuntime, isLoading: loadingAverageRuntime } = useQuery('averageRuntime', fetchAverageRuntime);
    const { data: mostPopularMovie, isLoading: loadingMostPopularMovie } = useQuery('mostPopularMovie', fetchMostPopularMovie);
    const { data: uniqueLanguages, isLoading: loadingUniqueLanguages } = useQuery('uniqueLanguages', fetchUniqueLanguages);

    const [hoveredCard, setHoveredCard] = useState(null); // State to track hovered card

    if (loadingTotalMovies || loadingTopRatedMovie || loadingMostFrequentGenre || loadingAverageRuntime) {
        return (
            <Card sx={{ margin: 2, textAlign: 'center' }}>
                <CardContent>
                    <CircularProgress /> {/* Loading spinner */}
                </CardContent>
            </Card>
        );
    }

    return (
        <Grid container spacing={2} sx={{ padding: 2 }}>
            {/* Total Movies */}
            <Grid item xs={12} sm={6} md={2.4}>
                <Tooltip title="This shows the total number of movies in the database" arrow>
                    <Card
                        onMouseEnter={() => setHoveredCard('totalMovies')}
                        onMouseLeave={() => setHoveredCard(null)}
                        sx={{ transition: 'transform 0.3s', transform: hoveredCard === 'totalMovies' ? 'scale(1.05)' : 'scale(1)' }}
                    >
                        <CardContent>
                            {hoveredCard === 'totalMovies' ? (
                                <>
                                    <Typography variant="h5">Total Movies</Typography>
                                    <Typography variant="h6">{totalMovies}</Typography>
                                    <Typography variant="body2">Explore all available movies through search and filter</Typography>
                                </>
                            ) : (
                                <>
                                    <Typography variant="h5">Total Movies</Typography>
                                    <Typography variant="h4">{totalMovies}</Typography>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Tooltip>
            </Grid>

            {/* Highest Rating */}
            <Grid item xs={12} sm={6} md={2.4}>
                <Tooltip title="The highest average rating of all movies in the collection" arrow>
                    <Card
                        onMouseEnter={() => setHoveredCard('highestRating')}
                        onMouseLeave={() => setHoveredCard(null)}
                        sx={{ transition: 'transform 0.3s', transform: hoveredCard === 'highestRating' ? 'scale(1.05)' : 'scale(1)' }}
                    >
                        <CardContent>
                            {hoveredCard === 'highestRating' ? (
                                <>
                                    <Typography variant="h5">Highest Rating</Typography>
                                    <Typography variant="h6">{topRatedMovie.AverageRating?.toFixed(2)}</Typography>
                                    <Typography variant="body2">Release Date: {topRatedMovie.release_date || 'N/A'}</Typography>
                                    <Typography variant="body2">Movie: {topRatedMovie.title || 'N/A'}</Typography>
                                </>
                            ) : (
                                <>
                                    <Typography variant="h5">Highest Rating</Typography>
                                    <Typography variant="h4">{topRatedMovie.AverageRating?.toFixed(2) || 'N/A'}</Typography>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Tooltip>
            </Grid>

            {/* Most Popular Movie
            <Grid item xs={12} sm={6} md={2.4}>
                <Tooltip title="The movie with the highest popularity" arrow>
                    <Card
                        onMouseEnter={() => setHoveredCard('mostPopularMovie')}
                        onMouseLeave={() => setHoveredCard(null)}
                        sx={{ transition: 'transform 0.3s', transform: hoveredCard === 'mostPopularMovie' ? 'scale(1.05)' : 'scale(1)' }}
                    >
                        <CardContent>
                            {hoveredCard === 'mostPopularMovie' ? (
                                <>
                                    <Typography variant="h5">Most Popular Movie</Typography>
                                    <Typography variant="h6">{mostPopularMovie.title || 'N/A'}</Typography>
                                    <Typography variant="body2">Rating: {mostPopularMovie.AverageRating?.toFixed(2) || 'N/A'}</Typography>
                                    <Typography variant="body2">Director: {mostPopularMovie.Director || 'N/A'}</Typography>
                                </>
                            ) : (
                                <>
                                    <Typography variant="h5">Most Popular Movie</Typography>
                                    <Typography variant="h4">{mostPopularMovie.title || 'N/A'}</Typography>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Tooltip>
            </Grid>
            */}

            {/* Most Frequent Genre */}
            <Grid item xs={12} sm={6} md={2.4}>
                <Tooltip title="The genre that appears most frequently in the collection" arrow>
                    <Card
                        onMouseEnter={() => setHoveredCard('mostFrequentGenre')}
                        onMouseLeave={() => setHoveredCard(null)}
                        sx={{ transition: 'transform 0.3s', transform: hoveredCard === 'mostFrequentGenre' ? 'scale(1.05)' : 'scale(1)' }}
                    >
                        <CardContent>
                            {hoveredCard === 'mostFrequentGenre' ? (
                                <>
                                    <Typography variant="h5">Most Frequent Genre</Typography>
                                    <Typography variant="h6">{mostFrequentGenre}</Typography>
                                    <Typography variant="body2">Popular across the collection</Typography>
                                </>
                            ) : (
                                <>
                                    <Typography variant="h5">Most Frequent Genre</Typography>
                                    <Typography variant="h4">{mostFrequentGenre}</Typography>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Tooltip>
            </Grid>

            {/* Total Unique Languages */}
            <Grid item xs={12} sm={6} md={2.4}>
                <Tooltip title="Total unique languages represented in the spoken languages of movies" arrow>
                    <Card
                        onMouseEnter={() => setHoveredCard('uniqueLanguages')}
                        onMouseLeave={() => setHoveredCard(null)}
                        sx={{ transition: 'transform 0.3s', transform: hoveredCard === 'uniqueLanguages' ? 'scale(1.05)' : 'scale(1)' }}
                    >
                        <CardContent>
                            {hoveredCard === 'uniqueLanguages' ? (
                                <>
                                    <Typography variant="h5">Unique Languages</Typography>
                                    <Typography variant="h6">{uniqueLanguages}</Typography>
                                    <Typography variant="body2">Languages spoken across all movies</Typography>
                                </>
                            ) : (
                                <>
                                    <Typography variant="h5">Unique Languages</Typography>
                                    <Typography variant="h4">{uniqueLanguages}</Typography>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Tooltip>
            </Grid>


        </Grid>
    );
};


export default KpiCards;
