import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MovieIcon from '@mui/icons-material/Movie';
import AccountCircle from '@mui/icons-material/AccountCircle';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, NavLink  } from 'react-router-dom'; // For navigation
import { styled } from '@mui/material/styles';
import axios from 'axios';
import '../App.css';

const StyledNavLink = styled(NavLink)(({ theme }) => ({
    textDecoration: 'none',
    color: 'inherit',
    margin: '0 10px',
    padding: '10px', // Add padding for better clickability
    borderRadius: '4px', // Add rounded corners for aesthetics
    transition: 'background-color 0.3s, color 0.3s', // Smooth transition for hover and active states

    // Hover effect
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        color: 'pink',
    },

    // Active link styles
    '&.active': {
        fontWeight: 'bold',
        backgroundColor: theme.palette.primary.main, // Change background color to primary
        color: 'red', // Change text color to white for better visibility
    },
}));

const Navbar = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [animationClass, setAnimationClass] = useState('fade-in');
    const [loginError, setLoginError] = useState('');
    const [registerMessage, setRegisterMessage] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
        setLoginError('');
        setRegisterMessage('');
        setEmail(''); // Clear the email field
        setPassword(''); //Clear the password field
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setIsRegistering(false);
        setLoginError('');
        setRegisterMessage('');
        setEmail(''); // Clear the email field
        setPassword(''); //Clear the password field
    };

    const isMenuOpen = Boolean(anchorEl);

    const handleLogin = () => {
        if (!email && !password) {
            setLoginError('Email and Password are required.');
            setEmail(''); // Clear the email field
            setPassword(''); // Clear the password field
            return;
        } else if (!email) {
            setLoginError('Email is required.');
            setEmail(''); // Clear the email field
            setPassword(''); // Clear the password field
            return;
        } else if (!password) {
            setLoginError('Password is required.');
            setEmail(''); // Clear the email field
            setPassword(''); // Clear the password field
            return;
        }

        // Send login request to FastAPI backend
        axios.post('http://127.0.0.1:8000/movie/login', { email, password })
            .then(response => {
                // Check if the login was successful
                if (response.data.access_token) {
                    // Store the token in localStorage (or sessionStorage if you prefer)
                    localStorage.setItem('token', response.data.access_token);
                    localStorage.setItem('userEmail', email); // Save the email
                    localStorage.removeItem('fetchState'); //refresh the fetchState


                    // Navigate to the UserDashboard page
                    navigate('/user-dashboard');

                    // Clear the input fields
                    setEmail('');
                    setPassword('');
                } else {
                    setLoginError('Invalid email or password.');
                    setEmail(''); // Clear the email field
                    setPassword(''); // Clear the password field
                }
            })
            .catch((error) => {
                // Catching the backend 400 error for invalid emails and passwords
                const errorMessage = error.response?.data?.detail || 'Error occurred during registration.';
                setLoginError(errorMessage);
                setEmail(''); // Clear the email field
                setPassword('');
            });
    };

    const handleRegister = () => {
        if (!email && !password ) {
            setRegisterMessage('Email and Password is required.');
            setEmail(''); // Clear the email field
            setPassword(''); //Clear the password field
            return;
        }

        else if (!email) {
            setRegisterMessage('Email is required.');
            setEmail(''); // Clear the email field
            setPassword(''); //Clear the password field
            return;
        }

        else if (!password) {
            setRegisterMessage('Password is required.');
            setEmail(''); // Clear the email field
            setPassword(''); //Clear the password field
            return;
        }

        axios.post('http://127.0.0.1:8000/movie/register', { email, password})
            .then(response => {
                setRegisterMessage('Registration successful. You can now log in.');
                setEmail(''); // Clear the email field
                setPassword('');
            })
            .catch((error) => {
                // Catching the backend 400 error for already registered emails
                const errorMessage = error.response?.data?.detail || 'Error occurred during registration.';
                setRegisterMessage(errorMessage);
                setEmail(''); // Clear the email field
                setPassword('');
            });
    };

    const handleRegisterClick = () => {
        setAnimationClass('fade-out');
        setTimeout(() => {
            setIsRegistering(true);
            setAnimationClass('fade-in');
        }, 300);
        setLoginError('');
        setRegisterMessage('');
        setEmail(''); // Clear the email field
        setPassword(''); //Clear the password field
    };

    const handleBackToLoginClick = () => {
        setAnimationClass('fade-out');
        setTimeout(() => {
            setIsRegistering(false);
            setAnimationClass('fade-in');
        }, 300);
        setLoginError('');
        setRegisterMessage('');
        setEmail(''); // Clear the email field
        setPassword(''); //Clear the password field
    };

    return (
        <Box sx={{ flexGrow: 1, marginBottom: 2 }}>
            <AppBar position="static">
                <Toolbar>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                            Good_Soup IMDb
                            <MovieIcon sx={{ mr: 1, ml: 1 }} />
                            Movie Dashboard
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                        <StyledNavLink to="/">Home</StyledNavLink>
                        <StyledNavLink to="/search">Search</StyledNavLink>
                        <StyledNavLink to="/filter">Filter</StyledNavLink>
                        <IconButton edge="end" color="inherit" onClick={handleMenuOpen}>
                            <AccountCircle />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
                PaperProps={{ sx: { padding: 2, width: 300 } }}
            >
                <div className={animationClass}>
                    {isRegistering ? (
                        <>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <IconButton onClick={handleBackToLoginClick}>
                                    <ArrowBackIcon />
                                </IconButton>
                                <Typography variant="h6" gutterBottom align="center">
                                    Register
                                </Typography>
                            </Box>
                            <TextField label="Email" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
                            <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
                            {registerMessage && (
                                <Typography color={registerMessage.includes('error' && 'required') ? 'error' : 'textPrimary'} align="center">
                                    {registerMessage}
                                </Typography>
                            )}
                            <Button variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }} onClick={handleRegister}>
                                Register
                            </Button>
                        </>
                    ) : (
                        <>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6" gutterBottom>Login</Typography>
                                <IconButton onClick={handleMenuClose}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            <TextField label="Email" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
                            <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
                            {loginError && <Typography color="error" align="center">{loginError}</Typography>}
                            <Button variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }} onClick={handleLogin}>
                                Login
                            </Button>
                            <Divider sx={{ marginY: 2 }} />
                            <Typography align="center">Don't have an account?</Typography>
                            <Button variant="outlined" color="secondary" fullWidth sx={{ marginTop: 2 }} onClick={handleRegisterClick}>
                                Register
                            </Button>
                        </>
                    )}
                </div>
            </Menu>
        </Box>
    );
};

export default Navbar;
