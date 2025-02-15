// src/pages/Dashboard.js

import React, {useState} from 'react';
import Navbar from '../Components/Navbar';
import KpiCards from '../Components/KpiCards';
import TopMoviesChart from '../Components/TopMoviesChart';
import GenreBreakdownChart from '../Components/GeneralBreakdownChart';
import ReleasesOverTimeChart from '../Components/ReleaseOverTimeChart';
import MovieTable from '../Components/MovieTable';
import SearchBar from '../Components/SearchBar';
import MultiChart from "../Components/MultiChart";
import ActorFrequency from "../Components/ActorFrequency"
import RatingsDistributionChart from "../Components/RatingsDistributionChart";
import ProductionCountryChart from "../Components/ProductionCountryChart";
import { Container, Grid, Card, CardContent, Typography } from '@mui/material';

const Dashboard = () => {
    return (
        <div>
            <Navbar />
            <Container>
                <KpiCards />
                <MultiChart/>
                {/*
                <Grid container spacing={2} sx={{ padding: 2 }}>
                    <ExpandableChartCard title="Top 10 Movies" chart={<TopMoviesChart />} bgColor="#FFC107" />
                    <ExpandableChartCard title="Ratings Distribution" chart={<RatingsDistributionChart />} bgColor="#4CAF50" />
                    <ExpandableChartCard title="Actor Frequency" chart={<ActorFrequency />} bgColor="#03A9F4"/>
                    <ExpandableChartCard title="Revenue and Releases Over Time" chart={<ReleasesOverTimeChart />} bgColor="#FF5722"/>
                    <ExpandableChartCard title="Genre Breakdown" chart={<GenreBreakdownChart />} bgColor="#CBC3E3"/>
                    <ExpandableChartCard title="Movies by Production Country" chart={<ProductionCountryChart />} bgColor="#FFC0CB"/>

                </Grid>
                */}
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

export default Dashboard;
