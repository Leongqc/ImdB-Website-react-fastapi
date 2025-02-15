// src/pages/MovieDetailPage.js

import React, { useEffect, useState } from 'react';
import Navbar from '../Components/Navbar';
import MovieDetails from '../Components/MovieDetails';
import UserNavbar from "../Components/UserNavbar";
import { Container } from '@mui/material';

const MovieDetailPage = () => {

    const [token, setToken] = useState(null); // State to hold the token

    useEffect(() => {
        // Check if the token exists in local storage
        const storedToken = localStorage.getItem('token');
        setToken(storedToken);
    }, []);

    return (
        <div>
            {/*
            {token ? <UserNavbar /> : <Navbar />}
            */}
            <Container>
                <MovieDetails />
            </Container>
        </div>
    );
};

export default MovieDetailPage;
