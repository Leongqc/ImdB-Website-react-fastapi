// src/pages/UserDashboard.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Correctly importing jwtDecode as a named import
import UserNavbar from '../Components/UserNavbar';
import KpiCards from '../Components/KpiCards';
import TopMoviesChart from '../Components/TopMoviesChart';
import GenreBreakdownChart from '../Components/GeneralBreakdownChart';
import ReleasesOverTimeChart from '../Components/ReleaseOverTimeChart';
import MovieTable from '../Components/MovieTable';
import SearchBar from '../Components/SearchBar';
import ActorFrequency from "../Components/ActorFrequency";
import RatingsDistributionChart from "../Components/RatingsDistributionChart";
import FavoriteMovie from "../Components/FavoriteMovie";
import ProductionCountryChart from "../Components/ProductionCountryChart";
import SuggestedMovies from "../Components/SuggestionMovie";
import MultiChart from "../Components/MultiChart";
import {Card, CardContent, Container, Grid, Typography} from '@mui/material';

const UserDashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token'); // Retrieve the token

        if (!token) {
            navigate('/'); // Redirect to dashboard if no token
            return;
        }

        // Function to check if the token is expired
        const isTokenExpired = (token) => {
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000; // Convert to seconds
            return decodedToken.exp < currentTime; // Check if the token is expired
        };

        // Check if the token is expired
        if (isTokenExpired(token)) {
            localStorage.removeItem('token'); // Remove expired token
            navigate('/'); // Redirect to login page
        }
    }, [navigate]);

    const [preferences, setPreferences] = useState([]);

    const handleUpdatePreferences = (newPreferences) => {
        setPreferences(newPreferences);
    };

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/movie/user-preferences', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const data = await response.json();
                setPreferences(data.components);
            } catch (error) {
                console.error('Failed to fetch preferences:', error);
            }
        };

        fetchPreferences();
    }, []);

    return (
        <div>
            <UserNavbar onUpdatePreferences={handleUpdatePreferences} />
            <Container>
                <Grid container spacing={2} sx={{ padding: 1 }}>
                    {preferences
                        .filter(pref => pref.isVisible) // Only get visible preferences
                        .map(pref => {
                         switch (pref.id) {
                            case "1":
                                return <FavoriteMovie key={pref.id} />;
                            case "2":
                                return <KpiCards key={pref.id} />;
                            case "3":
                                return (
                                    <ExpandableChartCard title="Genre Breakdown" chart={<GenreBreakdownChart />} bgColor="#CBC3E3" key={pref.id}/>
                                );
                             case "4":
                                return (
                                    <ExpandableChartCard title="Actor Frequency" chart={<ActorFrequency />} bgColor="#03A9F4" key={pref.id}/>

                                );
                            case "5":
                                return (
                                    <ExpandableChartCard title="Revenue and Releases Over Time" chart={<ReleasesOverTimeChart />} bgColor="#FF5722" key={pref.id}/>

                                );
                            case "6":
                                return (
                                    <ExpandableChartCard title="Ratings Distribution" chart={<RatingsDistributionChart />} bgColor="#4CAF50" key={pref.id}/>
                                );
                            case "7":
                                return <SearchBar key={pref.id} />;
                            case "8":
                                return <MovieTable key={pref.id} />;
                            case "9":
                                 return (
                                     <ExpandableChartCard title="Top 10 Highest-Rated Movies" chart={<TopMoviesChart />} bgColor="#FFC107" key={pref.id}/>
                                 );
                            case "10":
                                 return (
                                     <ExpandableChartCard title="Movies by Production Country" chart={<ProductionCountryChart />} bgColor="#FFC0CB" key={pref.id}/>
                                 );
                            case "11":
                                 return <SuggestedMovies key={pref.id}/>
                            case "12":
                                 return <MultiChart key={pref.id}/>
                            default:
                                return null; // Fallback in case no match
                        }
                    })}
                </Grid>
            </Container>
        </div>
    );
};

const ExpandableChartCard = ({ title, chart, bgColor}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Grid item xs={12} sm={6} md={4}>
            <Card
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                bgColor={bgColor}
                sx={{
                    backgroundColor: bgColor, // Dynamic background color
                    transition: 'all 0.5s ease',
                    height: isHovered ? '500px' : '150px',
                    width: isHovered ? '800px' : '100%',
                    position: isHovered ? 'absolute' : 'relative', // Optional: Avoid shifting layout
                    zIndex: isHovered ? 100 : 1,
                    overflow: 'hidden',
                }}
            >
                <CardContent sx={{ padding: 2 }}>
                    <Typography variant="h5" gutterBottom>
                        {title}
                    </Typography>

                    {isHovered ? (
                        <div>{chart}</div> // Render chart when hovered
                    ) : (
                        <Typography variant="body2" color="textSecondary">
                            Hover to expand and view chart
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Grid>
    );
};

export default UserDashboard;
