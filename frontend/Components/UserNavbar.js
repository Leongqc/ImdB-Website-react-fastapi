import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import MovieIcon from "@mui/icons-material/Movie";
import SettingsIcon from '@mui/icons-material/Settings';
import React, { useState, useEffect } from 'react';
import { Menu, MenuItem, IconButton, AppBar, Toolbar, Typography, Box, Button, Checkbox, List, ListItem, TextField, CircularProgress} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useNavigate, NavLink  } from 'react-router-dom'; // For navigation
import { styled } from '@mui/material/styles';
import axios from 'axios';
import '../App.css'; // Include CSS for fade-in, fade-out animations

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

const UserNavbar = ({ onUpdatePreferences }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const [animationClass, setAnimationClass] = useState('fade-in');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [retypeNewPassword, setRetypeNewPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); // Store success message text
    const [successMessageClass, setSuccessMessageClass] = useState(''); // // Control visibility class
    const [passwordError, setPasswordError] = useState({
        oldPasswordError: '',
        newPasswordError: '',
        retypePasswordError: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userEmail, setUserEmail] = useState('');
    const [isSettingPreferences, setIsSettingPreferences] = useState(false);
    const [components, setComponents] = useState([]);


    useEffect(() => {
        // Retrieve the email address from localStorage when the component mounts
        const email = localStorage.getItem('userEmail'); // Assume this is how you stored the email
        setUserEmail(email);
    }, []);

    //Handle General Menu
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setIsChangingPassword(false);
        setOldPassword('');
        setNewPassword('');
        setRetypeNewPassword('');
        setPasswordError({
            oldPasswordError: '',
            newPasswordError: '',
            retypePasswordError: ''
        });
        setIsSettingPreferences(false);
        setError('');
        setComponents([]);
    };

    const handleLogout = () => {
        // Clear token from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('selectedGenre');
        localStorage.removeItem('selectedYear');
        localStorage.removeItem('fetchState');
        // Navigate to login page
        navigate('/');
    };

    const handleBackToMenuClick = () => {
        setAnimationClass('fade-out');
        setTimeout(() => {
            setIsChangingPassword(false);
            setAnimationClass('fade-in');
            setIsSettingPreferences(false);
            setAnimationClass('fade-in');
        }, 300);
        setOldPassword('');
        setNewPassword('');
        setRetypeNewPassword('');
        setPasswordError({
            oldPasswordError: '',
            newPasswordError: '',
            retypePasswordError: ''
        });
        setError('');
        setComponents([]);
    };

    //Handle Preference Setting
    const moveUp = (index) => {
        if (index > 0) {
            const newPreferences = [...components];
            [newPreferences[index - 1], newPreferences[index]] = [newPreferences[index], newPreferences[index - 1]];
            setComponents(newPreferences);
        }
    };

    const moveDown = (index) => {
        if (index < components.length - 1) {
            const newPreferences = [...components];
            [newPreferences[index], newPreferences[index + 1]] = [newPreferences[index + 1], newPreferences[index]];
            setComponents(newPreferences);
        }
    };

    const toggleVisibility = (index) => {
        const newPreferences = [...components];
        newPreferences[index].isVisible = !newPreferences[index].isVisible; // Change 'visible' to 'isVisible'
        setComponents(newPreferences);
    };

    const handleSavePreferences = () => {
        const token = localStorage.getItem('token');
        // Save the preferences via API call
        axios.post('http://127.0.0.1:8000/movie/update-user-preference', {components: components}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(() => {

                // Trigger back-to-menu effect
                setAnimationClass('fade-out');
                setTimeout(() => {
                    setIsSettingPreferences(false);
                    setAnimationClass('fade-in');

                    // Show success message
                    setSuccessMessage('Preferences updated successfully!');
                    setSuccessMessageClass('show');

                    onUpdatePreferences(components); // Pass updated preferences back to UserDashboard

                    // Hide success message after 3 seconds
                    setTimeout(() => {
                        setSuccessMessageClass(''); // Reset the class to hide the message
                    }, 3000);
                }, 300);

            })
            .catch(error => console.error('Failed to save preferences:', error));
    };

    const handleToSetPreferenceClick = () => {
        setAnimationClass('fade-out');
        setTimeout(() => {
            setIsSettingPreferences(true);
            setAnimationClass('fade-in');
        }, 300);

        // Make API request to fetch preferences
        const token = localStorage.getItem('token');
        axios.get('http://127.0.0.1:8000/movie/user-preferences', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                setComponents(response.data.components); // Assuming the backend returns the components array
                setLoading(false);
            })
            .catch((error) => {
                setError('Failed to load preferences');
                setLoading(false);
            });
    };

    const renderSetPreferenceForm = () => (
        <div className={animationClass}>
            <IconButton onClick={handleBackToMenuClick}>
                <ArrowBackIcon/>
            </IconButton>
            <Typography variant="h6">Set Preferences</Typography>
            {loading ? (
                <CircularProgress/>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <List>
                    {components.map((component, index) => (
                        <ListItem key={component.id} disableGutters>
                            <Box display="flex" alignItems="center" width="100%">
                                <Checkbox
                                    checked={component.isVisible}
                                    onChange={() => toggleVisibility(index)}
                                />
                                <Typography variant="body1" style={{ flexGrow: 1, paddingLeft: '7px' }}>
                                    {component.label}
                                </Typography>
                                <Box>
                                    <IconButton onClick={() => moveUp(index)} disabled={index === 0}>
                                        <ArrowBackIcon style={{ transform: 'rotate(90deg)' }} />
                                    </IconButton>
                                    <IconButton onClick={() => moveDown(index)} disabled={index === components.length - 1}>
                                        <ArrowBackIcon style={{ transform: 'rotate(-90deg)' }} />
                                    </IconButton>
                                </Box>
                            </Box>
                        </ListItem>
                    ))}
                </List>
            )}
            <Button variant="contained" color="primary" fullWidth onClick={handleSavePreferences}>
                Save Preferences
            </Button>
        </div>
    );

    //Handle Change Password Related
    const handleToChangePasswordClick = () => {
        setAnimationClass('fade-out'); // Start fade-out effect
        setTimeout(() => {
            setIsChangingPassword(true); // Switch to password form after transition
            setAnimationClass('fade-in'); // Start fade-in effect for the password form
        }, 300);
    };

    const handleChangePassword = () => {
        setPasswordError({
            oldPasswordError: '',
            newPasswordError: '',
            retypePasswordError: ''
        });

        // Validate input fields
        if (!oldPassword) {
            setPasswordError(prev => ({...prev, oldPasswordError: 'Old password is required'}));
            return;
        }
        if (!newPassword) {
            setPasswordError(prev => ({...prev, newPasswordError: 'New password is required'}));
            return;
        }
        if (newPassword !== retypeNewPassword) {
            setPasswordError(prev => ({...prev, retypePasswordError: 'New passwords do not match'}));
            return;
        }

        // Get the JWT token from localStorage (or wherever you are storing it)
        const token = localStorage.getItem('token');  // Example, change as per your storage logic

        axios.post('http://127.0.0.1:8000/movie/change-password', {
            oldPassword,
            newPassword,
        }, {
            headers: {
                Authorization: `Bearer ${token}`  // Pass the JWT token in the Authorization header
            }
        })
            .then(() => {
                setOldPassword('');
                setNewPassword('');
                setRetypeNewPassword('');
                setPasswordError({
                    oldPasswordError: '',
                    newPasswordError: '',
                    retypePasswordError: ''
                });
                // Trigger back-to-menu effect
                setAnimationClass('fade-out');
                setTimeout(() => {
                    setIsChangingPassword(false);
                    setAnimationClass('fade-in');

                    // Show success message
                    setSuccessMessage('Password changed successfully!');
                    setSuccessMessageClass('show');

                    // Hide success message after 3 seconds
                    setTimeout(() => {
                        setSuccessMessageClass(''); // Reset the class to hide the message
                    }, 3000);
                }, 300);
            })
            .catch((error) => {
                if (error.response && error.response.status === 400) {
                    setPasswordError(prev => ({
                        ...prev,
                        oldPasswordError: 'Incorrect old password'
                    }));
                } else {
                    console.error("Failed to change password", error);
                }
            });
    };

    const renderChangePasswordForm = () => (
        <div className={animationClass}>
            <IconButton onClick={handleBackToMenuClick}>
                <ArrowBackIcon/>
            </IconButton>
            <Typography variant="h6">Change Password</Typography>
            <TextField
                label="Old Password"
                type="password"
                fullWidth
                margin="normal"
                value={oldPassword}
                onChange={(e) => {
                    setOldPassword(e.target.value);
                    setPasswordError({...passwordError, oldPasswordError: ''});
                }}
                error={!!passwordError.oldPasswordError}
                helperText={passwordError.oldPasswordError}
            />
            <TextField
                label="New Password"
                type="password"
                fullWidth
                margin="normal"
                value={newPassword}
                onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError({...passwordError, newPasswordError: ''});
                }}
                error={!!passwordError.newPasswordError}
                helperText={passwordError.newPasswordError}
            />
            <TextField
                label="Retype New Password"
                type="password"
                fullWidth
                margin="normal"
                value={retypeNewPassword}
                onChange={(e) => {
                    setRetypeNewPassword(e.target.value);
                    setPasswordError({...passwordError, retypePasswordError: ''});
                }}
                error={!!passwordError.retypePasswordError}
                helperText={passwordError.retypePasswordError}
            />
            <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleChangePassword}
            >
                Change Password
            </Button>
        </div>
    );

    return (
        <Box sx={{flexGrow: 1}}>
            <AppBar position="static">
                <Toolbar>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                            Good_Soup IMDb
                            <MovieIcon sx={{ mr: 1, ml: 1 }} />
                            User Dashboard
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                        <StyledNavLink to="/user-dashboard">Home</StyledNavLink>
                        <StyledNavLink to="/search">Search</StyledNavLink>
                        <StyledNavLink to="/filter">Filter</StyledNavLink>
                        {userEmail && (
                            <Typography variant="body1" sx={{ marginRight: 2, color: 'white' }}>
                                | Welcome {userEmail} !
                            </Typography>
                        )}
                        <IconButton edge="end" color="inherit" onClick={handleMenuOpen}>
                            <SettingsIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Success Message as a Fly Window */}
            {successMessage && (
                <div className={`success-box ${successMessageClass}`}>
                    {successMessage}
                </div>
            )}

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{ sx: { padding: 2, width: 300 } }}
            >
                {isChangingPassword ? (
                    renderChangePasswordForm()
                ) : isSettingPreferences ? (
                    renderSetPreferenceForm()
                ):(
                    <div className={animationClass}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" gutterBottom>Setting Menu</Typography>
                            <IconButton onClick={handleMenuClose}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <MenuItem onClick={handleToChangePasswordClick}>Change Password</MenuItem>
                        <MenuItem onClick={handleToSetPreferenceClick}>Preferences</MenuItem>
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </div>
                )}
            </Menu>
        </Box>
    );
};

export default UserNavbar;
