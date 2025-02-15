import UserNavbar from "../Components/UserNavbar";
import React, {useEffect, useState} from 'react';
import Navbar from '../Components/Navbar';
import MovieTable from '../Components/MovieTable';
import { Container, Grid } from '@mui/material';

const FilterPage = () => {

    const [token, setToken] = useState(null); // State to hold the token

    useEffect(() => {
        // Check if the token exists in local storage
        const storedToken = localStorage.getItem('token');
        setToken(storedToken);
    }, []);
    return (

        <div>
            {token ? <UserNavbar /> : <Navbar />}
            <Container>
                <MovieTable />
            </Container>
        </div>
    );
};

export default FilterPage;