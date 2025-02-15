import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TextField,
    MenuItem,
    Button,
    Card,
    CardContent,
    Grid,
    Typography,
    List,
    ListItem,
    TableCell, TableRow, Table, TableBody, TableContainer, TableHead,
    Checkbox, FormControlLabel,
} from '@mui/material';
import axios from 'axios';

const categories = [
    { label: 'Title', value: 'title' },
    { label: 'Director', value: 'director' },
    // Add more categories as needed
];

const genres = [
    { label: 'Unknown', value: 'Unknown' },
    { label: 'Documentary', value: 'Documentary' },
    { label: 'Drama', value: 'Drama' },
    { label: 'Comedy', value: 'Comedy' },
    { label: 'Horror', value: 'Horror' },
    { label: 'Thriller', value: 'Thriller' },
    { label: 'Animation', value: 'Animation' },
    { label: 'Music', value: 'Music' },
    { label: 'Action', value: 'Action' },
    { label: 'Romance', value: 'Romance' },
    { label: 'Science Fiction', value: 'Science Fiction' },
    { label: 'Crime', value: 'Crime' },
    { label: 'TV Movie', value: 'TV Movie' },
    { label: 'Mystery', value: 'Mystery' },
    { label: 'Fantasy', value: 'Fantasy' },
    { label: 'Family', value: 'Family' },
    { label: 'Adventure', value: 'Adventure' },
    { label: 'History', value: 'History' },

];

const SearchBar = () => {
    const [category, setCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenres, setSelectedGenres] = useState([]); // For genre selection
    const [ratingRange, setRatingRange] = useState([0, 10]); // For rating range
    const [yearRange, setYearRange] = useState([2019, new Date().getFullYear()]); // For year range
    const navigate = useNavigate();
    const token = localStorage.getItem('token');  // Get token from localStorage
    const [searchHistory, setSearchHistory] = useState([]);  // Store user's search history

    // Fetch user's search history if token exists
    useEffect(() => {
        if (token) {
            fetchSearchHistory();
        }
    }, [token]);

    const fetchSearchHistory = () => {
        axios.get('http://127.0.0.1:8000/movie/history-data', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setSearchHistory(response.data);  // Update state with fetched search history
            })
            .catch(error => {
                console.error('Error fetching search history:', error);
            });
    };

    const handleSearch = () => {
        if (category && searchTerm || selectedGenres && ratingRange && yearRange) {
            navigate(`/search-results?category=${category}&searchTerm=${searchTerm}&genres=${selectedGenres.join(',')}&ratingRange=${ratingRange.join(',')}&yearRange=${yearRange.join(',')}`);
            // Append the search result to the backend if the token exists
            if (token) {
                saveSearchHistory(category, searchTerm, selectedGenres, ratingRange, yearRange);
            }
        }
    };

    const saveSearchHistory = (category, searchTerm, selectedGenres, ratingRange, yearRange) => {
        // Replace empty data with "-" and join data where needed
        const formattedCategory = category || "-";
        const formattedSearchTerm = searchTerm || "-";
        const formattedGenres = selectedGenres.length > 0 ? selectedGenres.join(",") : "-"; // Join genres with comma
        const formattedRatingRange = ratingRange.length > 0 ? ratingRange.join("-") : "-"; // Join rating range with "-"
        const formattedYearRange = yearRange.length > 0 ? yearRange.join("-") : "-"; // Join year range with "-"

        const historyData = {
            history: [
                {
                    category: String(formattedCategory),
                    searchTerm: String(formattedSearchTerm),
                    selectedGenre: String(formattedGenres),
                    ratingRange: String(formattedRatingRange),
                    yearRange: String(formattedYearRange)
                }
            ]
        };

        // Send the formatted data to the backend
        axios.post('http://127.0.0.1:8000/movie/historyupdate', historyData, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(() => {
                fetchSearchHistory();  // Fetch updated search history after saving
            })
            .catch(error => {
                console.error('Error saving search history:', error);
            });
    };


    const handleGenreChange = (event) => {
        const value = event.target.value;
        setSelectedGenres(prev =>
            prev.includes(value) ? prev.filter(g => g !== value) : [...prev, value]
        );
    };

    const isValidHistoryItem = (item) => item.category && item.searchTerm;

    return (
        <Card sx={{ margin: 2, padding: 2 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Search Here (First 100 Data)
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            select
                            label="Select Category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            fullWidth
                        >
                            {categories.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            label="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1">Genres</Typography>
                        {genres.map((genre) => (
                            <FormControlLabel
                                key={genre.value}
                                control={
                                    <Checkbox
                                        checked={selectedGenres.includes(genre.value)}
                                        onChange={handleGenreChange}
                                        value={genre.value}
                                    />
                                }
                                label={genre.label}
                            />
                        ))}
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1">Rating Range</Typography>
                        <TextField
                            type="number"
                            label="Min Rating"
                            value={ratingRange[0]}
                            onChange={(e) => setRatingRange([e.target.value, ratingRange[1]])}
                            fullWidth
                        />
                        <TextField
                            type="number"
                            label="Max Rating"
                            value={ratingRange[1]}
                            onChange={(e) => setRatingRange([ratingRange[0], e.target.value])}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1">Year Range</Typography>
                        <TextField
                            type="number"
                            label="Min Year"
                            value={yearRange[0]}
                            onChange={(e) => setYearRange([e.target.value, yearRange[1]])}
                            fullWidth
                        />
                        <TextField
                            type="number"
                            label="Max Year"
                            value={yearRange[1]}
                            onChange={(e) => setYearRange([yearRange[0], e.target.value])}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" onClick={handleSearch}>
                            Search
                        </Button>
                    </Grid>
                </Grid>
                {token && (
                    <Card sx={{ marginTop: 2 }}>
                        <CardContent>
                            <Typography variant="h6">Search History</Typography>
                            {searchHistory.length === 0 || searchHistory.every(item => !item.category && !item.searchTerm) ? (
                                <TableRow>
                                    <TableCell colSpan={2} style={{ textAlign: 'center' }}>
                                        No Record Found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell><strong>Category</strong></TableCell>
                                                <TableCell><strong>Search Term</strong></TableCell>
                                                <TableCell><strong>Search Genre</strong></TableCell>
                                                <TableCell><strong>Rating Range</strong></TableCell>
                                                <TableCell><strong>Year Range</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {searchHistory.filter(isValidHistoryItem).map((historyItem, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{historyItem.category}</TableCell>
                                                    <TableCell>{historyItem.searchTerm}</TableCell>
                                                    <TableCell>{historyItem.selectedGenre}</TableCell>
                                                    <TableCell>{historyItem.ratingRange}</TableCell>
                                                    <TableCell>{historyItem.yearRange}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                )}
            </CardContent>
        </Card>
    );
};

export default SearchBar;
