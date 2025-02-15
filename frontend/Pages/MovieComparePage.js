import React from 'react';
import { useLocation, useNavigate} from 'react-router-dom';
import { Card, CardContent, Grid, Typography, Button, Divider, CircularProgress } from '@mui/material';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const fetchMovieDetails = async (movieId) => {
    const { data } = await axios.get(`http://127.0.0.1:8000/movies/${movieId}`);
    return data;
};

const ComparisonPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedMovies } = location.state || { selectedMovies: [] };

    const { data: movie1, isLoading: loadingMovie1 } = useQuery(['movie', selectedMovies[0]], () => fetchMovieDetails(selectedMovies[0]));
    const { data: movie2, isLoading: loadingMovie2 } = useQuery(['movie', selectedMovies[1]], () => fetchMovieDetails(selectedMovies[1]));

    if (loadingMovie1 || loadingMovie2) {
        return <CircularProgress />;
    }

    // Prepare data for the Bar chart
    const chartData = {
        labels: ['Rating', 'Popularity'],
        datasets: [
            {
                label: movie1.title,
                data: [movie1.AverageRating, movie1.popularity],
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
            },
            {
                label: movie2.title,
                data: [movie2.AverageRating, movie2.popularity],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Movie Comparison',
            },
        },
    };

    // Pie chart data for Rating and Popularity
    // Pie chart data for Rating and Popularity
    const createPieData = (value, max) => [
        { name: "Current", value: parseFloat(value.toFixed(2)) },
        { name: "Remaining", value: parseFloat((max - value).toFixed(2)) },
    ];

    const COLORS = ["#8884d8", "#d0d0d0"]; // Main color and background

    // Function to generate dynamic summary based on rating and popularity
    const generateSummaryText = (movie) => {
        let ratingDescription = '';
        let popularityDescription = '';

        // Define rating descriptions
        if (movie.AverageRating >= 8) {
            ratingDescription = (
                <span>
                <strong>{movie.title}</strong> has received outstanding reviews, with an impressive average rating of <strong>{movie.AverageRating.toFixed(2)}</strong>, making it a critically acclaimed film.
            </span>
            );
        } else if (movie.AverageRating >= 3) {
            ratingDescription = (
                <span>
                <strong>{movie.title}</strong> holds a respectable average rating of <strong>{movie.AverageRating.toFixed(2)}</strong>, indicating a generally positive reception.
            </span>
            );
        } else {
            ratingDescription = (
                <span>
                <strong>{movie.title}</strong> has a lower average rating of <strong>{movie.AverageRating.toFixed(2)}</strong>, which may suggest it appeals to a niche audience or polarizes viewers.
            </span>
            );
        }

        // Define popularity descriptions
        if (movie.popularity >= 60) {
            popularityDescription = (
                <span>
                Its popularity score of <strong>{movie.popularity.toFixed(2)}</strong> shows that <strong>{movie.title}</strong> is highly sought-after, likely due to its cultural impact or fanbase.
            </span>
            );
        } else if (movie.popularity >= 20) {
            popularityDescription = (
                <span>
                With a moderate popularity score of <strong>{movie.popularity.toFixed(2)}</strong>, <strong>{movie.title}</strong> maintains steady interest among audiences.
            </span>
            );
        } else {
            popularityDescription = (
                <span>
                <strong>{movie.title}</strong> has a lower popularity score of <strong>{movie.popularity.toFixed(2)}</strong>, possibly making it a hidden gem or an underappreciated film.
            </span>
            );
        }

        return (
            <>
                {ratingDescription} {popularityDescription}
            </>
        );
    };


    return (
        <Card sx={{ margin: 2, padding: 2 }}>
            <CardContent>
                <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />}>
                    Back
                </Button>
                <Typography variant="h4" gutterBottom>
                    Compare: {movie1.title} vs {movie2.title}
                </Typography>
                <Divider sx={{ marginBottom: 2 }} />

                <Grid container spacing={2}>
                    {/* Movie Details for Movie 1 */}
                    <Grid item xs={6}>
                        <Typography variant="h5">{movie1.title}</Typography>
                        <Typography variant="body2">Release Date: {movie1.release_date}</Typography>
                        <Typography variant="body2">Genres: {movie1.genres_list ? movie1.genres_list.join(', ') : 'N/A'}</Typography>
                        {/*
                        <Typography variant="body2">Director: {movie1.Director}</Typography>
                        <Typography variant="body2">Cast: {movie1.Cast_list ? movie1.Cast_list.join(', ') : 'N/A'}</Typography>
                        */}
                    </Grid>

                    {/* Movie Details for Movie 2 */}
                    <Grid item xs={6}>
                        <Typography variant="h5">{movie2.title}</Typography>
                        <Typography variant="body2">Release Date: {movie2.release_date}</Typography>
                        <Typography variant="body2">Genres: {movie2.genres_list ? movie2.genres_list.join(', ') : 'N/A'}</Typography>
                        {/*
                        <Typography variant="body2">Director: {movie2.Director}</Typography>
                        <Typography variant="body2">Cast: {movie2.Cast_list ? movie2.Cast_list.join(', ') : 'N/A'}</Typography>
                        */}
                    </Grid>
                </Grid>

                <Divider sx={{ margin: 4 }} />

                {/* Pie Charts for Ratings and Popularity Comparison */}
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={6}>
                        <Typography variant="h6" align="center">{movie1.title}</Typography>
                        <Grid container justifyContent="center" spacing={2}>
                            <Grid item>
                                <ResponsiveContainer width={100} height={100}>
                                    <PieChart>
                                        <Pie
                                            data={createPieData(movie1.AverageRating, 10)}
                                            dataKey="value"
                                            outerRadius={50}
                                            innerRadius={30}
                                        >
                                            {createPieData(movie1.AverageRating, 10).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <Typography align="center">Rating: {movie1.AverageRating.toFixed(2)}</Typography>
                            </Grid>
                            <Grid item>
                                <ResponsiveContainer width={100} height={100}>
                                    <PieChart>
                                        <Pie
                                            data={createPieData(movie1.popularity, 100)}
                                            dataKey="value"
                                            outerRadius={50}
                                            innerRadius={30}
                                        >
                                            {createPieData(movie1.popularity, 100).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <Typography align="center">Popularity: {movie1.popularity.toFixed(2)}</Typography>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="h6" align="center">{movie2.title}</Typography>
                        <Grid container justifyContent="center" spacing={2}>
                            <Grid item>
                                <ResponsiveContainer width={100} height={100}>
                                    <PieChart>
                                        <Pie
                                            data={createPieData(movie2.AverageRating, 10)}
                                            dataKey="value"
                                            outerRadius={50}
                                            innerRadius={30}
                                        >
                                            {createPieData(movie2.AverageRating, 10).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <Typography align="center">Rating: {movie2.AverageRating.toFixed(2)}</Typography>
                            </Grid>
                            <Grid item>
                                <ResponsiveContainer width={100} height={100}>
                                    <PieChart>
                                        <Pie
                                            data={createPieData(movie2.popularity, 100)}
                                            dataKey="value"
                                            outerRadius={50}
                                            innerRadius={30}
                                        >
                                            {createPieData(movie2.popularity, 100).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <Typography align="center">Popularity: {movie2.popularity.toFixed(2)}</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                <Divider sx={{ margin: 4 }} />

                {/* Analysis Description */}
                <Typography variant="h6" sx={{ marginTop: 4 }}>
                    Comparison Analysis
                </Typography>
                <Typography variant="body1" paragraph>
                    {generateSummaryText(movie1)}
                </Typography>
                <Typography variant="body1" paragraph>
                    {generateSummaryText(movie2)}
                </Typography>
                <Typography variant="body1" paragraph>
                    When comparing <strong>{movie1.title}</strong> and <strong>{movie2.title}</strong>, we can see that{" "}
                    {movie1.title} {movie1.AverageRating > movie2.AverageRating ? "outshines" : "trails"}{" "}
                    {movie2.title} in terms of critical reception, with{" "}
                    {movie1.AverageRating > movie2.AverageRating ? <strong>{movie1.title}</strong> : <strong>{movie2.title}</strong>}{" "}
                    receiving a higher rating. In terms of popularity,{" "}
                    {movie1.popularity > movie2.popularity ? <strong>{movie1.title}</strong> : <strong>{movie2.title}</strong>}{" "}
                    {movie1.popularity > movie2.popularity ? "continues to be a fan favorite" : "stands out as the more popular choice"}{" "}
                    among audiences today.
                </Typography>

                {/* Bar Chart for Overall Comparison
                <Typography variant="h5">Comparison Chart</Typography>
                <Bar data={chartData} options={options} />
                */}
            </CardContent>
        </Card>
    );
};

export default ComparisonPage;
