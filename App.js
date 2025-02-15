import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';  // Import React Query Client
import Dashboard from './Pages/Dashboard';
import MovieDetailPage from './Pages/MovieDetailPage';
import SearchResultPage from "./Pages/SearchResultPage";
import UserDashboard from "./Pages/UserDashboard";
import SearchPage from "./Pages/SearchPage";
import FilterPage from "./Pages/FilterPage";
import MovieComparePage from "./Pages/MovieComparePage";

// Create a QueryClient instance
const queryClient = new QueryClient();

function App() {
    return (
        // Wrap your application in the QueryClientProvider
        <QueryClientProvider client={queryClient}>
            <Router>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/filter" element={<FilterPage />} />
                    <Route path="/movies/:id" element={<MovieDetailPage />} />
                    <Route path="/search-results" element={<SearchResultPage />} />
                    <Route path="/user-dashboard" element={<UserDashboard />} />
                    <Route path="/movie-compare" element={<MovieComparePage />} />
                </Routes>
            </Router>
        </QueryClientProvider>
    );
}

export default App;
