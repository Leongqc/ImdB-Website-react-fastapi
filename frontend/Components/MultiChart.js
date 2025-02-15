import React, { useState } from 'react';
import {ZAxis, ScatterChart, Scatter, PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useQuery } from 'react-query';
import { Grid, Card, CardContent, Typography, CircularProgress, Select, MenuItem } from '@mui/material';

const fetchTopMovies = async (filter) => {
    const response = await fetch(`http://127.0.0.1:8000/movies/top-rated?filter=${filter}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const fetchPopRating = async (filter) => {
    const response = await fetch(`http://127.0.0.1:8000/movies/pop-vs-rating?filter=${filter}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const fetchProduction = async (filter) => {
    const response = await fetch(`http://127.0.0.1:8000/movies/production?filter=${filter}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const fetchActor = async (filter) => {
    const response = await fetch(`http://127.0.0.1:8000/movies/top-actors?filter=${filter}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const MultiChart = () => {
    const [filter, setFilter] = useState('highest-rated');

    // Fetch data based on the selected filter
    const { data: topMovies, isLoading, isError, error } = useQuery(['topMovies', filter], () => fetchTopMovies(filter));
    const { data: popRate, isLoading: isLoading2, isError: isError2, error: error2 } = useQuery(['popRate', filter], () => fetchPopRating(filter));
    const { data: production, isLoading: isLoading3, isError: isError3, error: error3 } = useQuery(['production', filter], () => fetchProduction(filter));
    const { data: actor, isLoading: isLoading4, isError: isError4, error: error4 } = useQuery(['actor', filter], () => fetchActor(filter));
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    // Custom tooltip component
    const CustomTooltipChart2 = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const { country, count, totalRevenue } = payload[0].payload;
            return (
                <div style={{
                    backgroundColor: "white",
                    padding: "8px",
                    borderRadius: "4px",
                    boxShadow: "0px 0px 6px rgba(0, 0, 0, 0.2)",
                    maxWidth: "150px",
                    fontSize: "12px"
                }}>
                    <p><strong>Country:</strong> {country}</p>
                    <p><strong>Movies:</strong> {count}</p>
                    <p><strong>Revenue:</strong> ${totalRevenue.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    const CustomTooltipActorFrequency = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const { actor, frequency } = payload[0].payload;
            return (
                <div style={{
                    backgroundColor: "white",
                    padding: "8px",
                    borderRadius: "4px",
                    boxShadow: "0px 0px 6px rgba(0, 0, 0, 0.2)",
                    maxWidth: "150px",
                    fontSize: "12px"
                }}>
                    <p><strong>Actor:</strong> {actor}</p>
                    <p><strong>Frequency:</strong> {frequency}</p>
                </div>
            );
        }
        return null;
    };


    return (
        <Grid container spacing={2} sx={{ padding: 2 }}>
            {/* Main Graph */}
            <Grid item xs={12} md={8}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Top 10 Movies by {filter.replace('-', ' ')}
                        </Typography>
                        <Select
                            value={filter}
                            onChange={handleFilterChange}
                            sx={{ marginBottom: 2, width: '100%' }}
                            variant="outlined"
                        >
                            <MenuItem value="highest-rated">Highest Rating</MenuItem>
                            {/* Genre-based filter options */}
                            <MenuItem value="Documentary">Documentary (Genre)</MenuItem>
                            <MenuItem value="Drama">Drama (Genre)</MenuItem>
                            <MenuItem value="Comedy">Comedy (Genre)</MenuItem>
                            <MenuItem value="Horror">Horror (Genre)</MenuItem>
                            <MenuItem value="Thriller">Thriller (Genre)</MenuItem>
                            <MenuItem value="Animation">Animation (Genre)</MenuItem>
                            <MenuItem value="Music">Music (Genre)</MenuItem>
                            <MenuItem value="Action">Action (Genre)</MenuItem>
                            <MenuItem value="Romance">Romance (Genre)</MenuItem>
                            <MenuItem value="Science Fiction">Science Fiction (Genre)</MenuItem>
                            <MenuItem value="Crime">Crime (Genre)</MenuItem>
                            <MenuItem value="TV Movie">TV Movie (Genre)</MenuItem>
                            <MenuItem value="Mystery">Mystery (Genre)</MenuItem>
                            <MenuItem value="Fantasy">Fantasy (Genre)</MenuItem>
                            <MenuItem value="Family">Family (Genre)</MenuItem>
                            <MenuItem value="Adventure">Adventure (Genre)</MenuItem>
                            <MenuItem value="History">History (Genre)</MenuItem>
                        </Select>
                        {isLoading ? (
                            <CircularProgress />
                        ) : isError ? (
                            <Typography color="error">{error.message}</Typography>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={topMovies} layout="vertical" margin={{ top: 20, right: 50, left: 50, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" domain={[0, 10]} />
                                    <YAxis type="category" dataKey="title" tick={{ fontSize: 15 }} />
                                    <Tooltip />
                                    <Bar dataKey={filter === 'popularity' ? 'popularity' : 'AverageRating'} fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </Grid>

            {/* Smaller Graphs */}
            <Grid item xs={12} md={4}>
                <Grid container spacing={2} direction="column">
                    <Grid item>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1">Chart 1 - Average Rating, Popularity and Release Over Time</Typography>
                                {isLoading2 ? (
                                    <CircularProgress />
                                ) : isError2 ? (
                                    <Typography color="error">{error2.message}</Typography>
                                ) : (
                                    <ResponsiveContainer width="100%" height={120}>
                                        <LineChart data={popRate}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="year" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="avgRating" stroke="#FF0000" name="Avg Rating" />
                                            <Line type="monotone" dataKey="avgPopularity" stroke="#82ca9d" name="Avg Popularity" />
                                            <Line type="monotone" dataKey="count" stroke="#0000FF" name="Total Movies" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1">Chart 2 - Production Country and Revenue</Typography>
                                {isLoading3 ? (
                                    <CircularProgress />
                                ) : isError3 ? (
                                    <Typography color="error">{error3.message}</Typography>
                                ) : (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={production.slice(0, 5)} // Take top 5 countries
                                                dataKey="count"
                                                nameKey="country"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                label={({ country, count }) => {
                                                    const total = production.slice(0, 5).reduce((sum, entry) => sum + entry.count, 0);
                                                    const percentage = ((count / total) * 100).toFixed(1);
                                                    return `${country} (${percentage}%)`;
                                                }}
                                                labelStyle={{ fontSize: 10 }} // Adjust label font size if needed
                                            >
                                                {production.slice(0, 5).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltipChart2 />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1">Chart 3 - Actor Frequency</Typography>
                                {isLoading4 ? (
                                    <CircularProgress />
                                ) : isError4 ? (
                                    <Typography color="error">{error4.message}</Typography>
                                ) : (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <ScatterChart>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" dataKey="frequency" name="Frequency" hide />
                                            <YAxis type="category" dataKey="actor" name="Actor" hide />
                                            <ZAxis type="number" dataKey="frequency" range={[50, 300]} />
                                            <Tooltip content={<CustomTooltipActorFrequency/>}/>
                                            <Scatter
                                                data={actor}
                                                fill="#ffc658"
                                                name="Actor Frequency"
                                            />
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default MultiChart;
