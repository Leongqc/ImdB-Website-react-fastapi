import {Token} from "@mui/icons-material";
import React, { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    TableSortLabel, Pagination, Typography, TextField, MenuItem, Select,
    FormControl, InputLabel, Box, Button
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Include CSS for fade-in, fade-out animations

const genres = ['Unknown', 'Documentary', 'Drama', 'Comedy', 'Horror', 'Thriller',
    'Animation', 'Music', 'Action', 'Romance', 'Science Fiction', 'Crime', 'TV Movie',
    'Mystery', 'Fantasy', 'Family', 'Adventure', 'History'];

const MovieTable = () => {
    const [movies, setMovies] = useState([]);
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('vote_average');
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [totalMovies, setTotalMovies] = useState(100);
    const [genre, setGenre] = useState(localStorage.getItem('selectedGenre') || ''); // Initialize with localStorage
    const [year, setYear] = useState(localStorage.getItem('selectedYear') || ''); // Initialize with localStorage
    const [token, setToken] = useState(localStorage.getItem('token') || null); // Initialize token with localStorage
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState(''); // Store success message text
    const [successMessageClass, setSuccessMessageClass] = useState(''); // // Control visibility class
    const fetchState = localStorage.getItem('fetchState') === false;  // Convert to boolean

    useEffect(() => {
        // Fetch the filter or movies on component mount
        if (token) {
            if (!fetchState) {
                fetchFilter(token); // Only fetch filter if fetchState is false (first time)
            } else {
                fetchMovies(genre, year); // Fetch movies if fetchState is true
            }
        } else {

            // If no token, just fetch movies based on genre and year
            fetchMovies(genre, year);

        }

    }, []);  // Only fetch on component mount (initial load)

    useEffect(() => {
        filterAndSortMovies();
    }, [movies, order, orderBy, year]);  // No genre here

    const fetchFilter = (token) => {
        axios.get(`http://127.0.0.1:8000/movie/getfilter`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                localStorage.setItem('fetchState', true); // Prevent refetching the filter
                const savedFilter = response.data;
                setGenre(savedFilter.genres);
                setYear(savedFilter.year);
                localStorage.setItem('selectedGenre', savedFilter.genres); // Save genre to localStorage
                localStorage.setItem('selectedYear', savedFilter.year); // Save year to localStorage
                fetchMovies(savedFilter.genres, savedFilter.year);
            })
            .catch(error => {
                console.error('Error fetching filter:', error);
            });
    }

    const fetchMovies = (selectedGenre = genre, selectedYear = year) => {
        let apiUrl = `http://127.0.0.1:8000/movies?limit=1000`;
        if (selectedGenre) apiUrl += `&genre=${selectedGenre}`;
        if (selectedYear) apiUrl += `&year=${selectedYear}`;

        axios.get(apiUrl)
            .then(response => {
                setMovies(response.data);
                setFilteredMovies(response.data);
                setTotalMovies(response.data.length);
                localStorage.setItem('fetchState', true); // Prevent refetching the filter
            })
            .catch(error => console.error(error));
    };

    const filterAndSortMovies = () => {
        let filtered = [...movies];

        // Filter by year
        if (year !== '') {
            filtered = filtered.filter(movie => movie.release_year === Number(year));
        }

        // Sort
        filtered.sort((a, b) => {
            if (orderBy === 'vote_average') {
                return order === 'asc' ? a.AverageRating - b.AverageRating : b.AverageRating - a.AverageRating;
            } else if (orderBy === 'release_year') {
                return order === 'asc' ? a.release_year - b.release_year : b.release_year - a.release_year;
            } else {
                return order === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
            }
        });

        setFilteredMovies(filtered);
    };

    const handleSortRequest = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleRowClick = (id) => {
        navigate(`/movies/${id}`);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleGenreChange = (event) => {
        setGenre(event.target.value);
        setPage(1); // Reset to first page when genre changes
        localStorage.setItem('selectedGenre', event.target.value); // Save to local storage
        fetchMovies(event.target.value, year);  // Fetch movies with the selected genre
    };

    const handleYearChange = (event) => {
        setYear(event.target.value);
        setPage(1); // Reset to first page when year changes
        localStorage.setItem('selectedYear', event.target.value); // Save to local storage
        fetchMovies(genre, event.target.value); // Fetch movies with the selected year
    };

    const handleFilterReset = () => {
        setGenre('');
        setYear('');
        localStorage.removeItem('selectedGenre');
        localStorage.removeItem('selectedYear');
        fetchMovies('', ''); // Fetch movies with no filters
    };

    const handleSaveAsFavorite = () => {
        if (!token) return; // If there's no token, do nothing

        axios.post(`http://127.0.0.1:8000/movie/save-filter`, {genres: genre, year: year}, {
            headers: { Authorization: `Bearer ${token}` } // Send the token with the request
        })
            .then(response => {
                setSuccessMessage('Filter updated successfully!');
                setSuccessMessageClass('show');
                // Hide success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage(''); // Clear the message
                    setSuccessMessageClass(''); // Reset class
                }, 3000);
            })
            .catch(error => {
                console.error('Error saving favorite movie:', error);
                // Handle error, e.g., show a notification
            });
    };

    return (
        <Paper sx={{ margin: 2, padding: 2 }}>
            <Typography variant="h6" gutterBottom>
                Filter Movies (First 100 Data)
            </Typography>
            {/* Filters */}
            <Box display="flex" gap={2} mb={2}>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel id="genre-label">Genre</InputLabel>
                    <Select
                        labelId="genre-label"
                        id="genre"
                        value={genre}
                        onChange={handleGenreChange}
                    >
                        <MenuItem value=""><em>All</em></MenuItem>
                        {genres.map((genreItem) => (
                            <MenuItem key={genreItem} value={genreItem}>
                                {genreItem}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    id="year"
                    label="Year"
                    type="number"
                    value={year}
                    onChange={handleYearChange}
                />

                <Button variant="outlined" onClick={handleFilterReset}>Reset Filters</Button>
                {token && ( // Show the button only if the token exists
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveAsFavorite}
                        sx={{ marginTop: 2 }}
                    >
                        Save as Favourite Filter
                    </Button>
                )}
                {successMessage && (
                    <div className={`filter-box ${successMessageClass}`}>
                        {successMessage}
                    </div>
                )}
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'title'}
                                    direction={orderBy === 'title' ? order : 'asc'}
                                    onClick={() => handleSortRequest('title')}
                                >
                                    Title
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'vote_average'}
                                    direction={orderBy === 'vote_average' ? order : 'asc'}
                                    onClick={() => handleSortRequest('vote_average')}
                                >
                                    Rating
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'release_year'}
                                    direction={orderBy === 'release_year' ? order : 'asc'}
                                    onClick={() => handleSortRequest('release_year')}
                                >
                                    Release Year
                                </TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredMovies.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} style={{ textAlign: 'center' }}>
                                    No movies found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredMovies.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((movie) => (
                                <TableRow key={movie.id} hover onClick={() => handleRowClick(movie.id)} style={{ cursor: 'pointer' }}>
                                    <TableCell>{movie.title}</TableCell>
                                    <TableCell>{movie.AverageRating}</TableCell>
                                    <TableCell>{movie.release_year}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <Pagination
                count={Math.ceil(filteredMovies.length / rowsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                sx={{ marginTop: 2, display: 'flex', justifyContent: 'center' }}
            />
        </Paper>
    );
};

export default MovieTable;
