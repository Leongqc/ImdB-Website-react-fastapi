import UserNavbar from "../Components/UserNavbar";
import React, {useEffect, useState} from 'react';
import Navbar from '../Components/Navbar';
import SearchBar from '../Components/SearchBar';
import { Container, Grid } from '@mui/material';

const SearchPage = () => {
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
                <SearchBar/>
            </Container>
        </div>
    );
};

export default SearchPage;