import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';

// Import des pages
import HomePage from './pages/HomePage';           // Landing page
import LoginPage from './pages/LoginPage';         // Page de connexion
import RegisterPage from './pages/RegisterPage';   // Page d'inscription
import UsersListPage from './pages/UsersListPage'; // Page liste utilisateurs
import AdminDashboard from './pages/AdminDashboard';

// Import des composants
import PrivateRoute from './components/auth/PrivateRoute';

// Import des styles
import 'react-toastify/dist/ReactToastify.css';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    const basename = '/ci-cd-react';

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                {/* --- Skip Link for Accessibility --- */}
                <a
                    href="#main-content"
                    style={{
                        position: 'absolute',
                        left: '-999px',
                        top: 'auto',
                        width: '1px',
                        height: '1px',
                        overflow: 'hidden',
                        zIndex: 9999,
                        background: '#fff',
                        color: '#1976d2',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    }}
                    tabIndex="0"
                    onFocus={e => { e.target.style.left = '16px'; e.target.style.width = 'auto'; e.target.style.height = 'auto'; }}
                    onBlur={e => { e.target.style.left = '-999px'; e.target.style.width = '1px'; e.target.style.height = '1px'; }}
                    aria-label="Aller directement au contenu principal"
                >
                    Aller au contenu principal
                </a>
                {/* --- End Skip Link --- */}

                <Router basename={basename}>
                    <div className="App">
                        {/* Ajoute id="main-content" pour la cible du skip link */}
                        <div id="main-content">
                            <Routes>
                                {/* Page d'accueil - Landing page */}
                                <Route path="/" element={<HomePage />} />

                                {/* Page de connexion */}
                                <Route path="/login" element={<LoginPage />} />

                                {/* Page d'inscription */}
                                <Route path="/register" element={<RegisterPage />} />

                                {/* Page liste des utilisateurs - PROTÉGÉE (connexion obligatoire) */}
                                <Route
                                    path="/users"
                                    element={
                                        <PrivateRoute>
                                            <UsersListPage />
                                        </PrivateRoute>
                                    }
                                />

                                {/* Dashboard admin (protégé) */}
                                <Route
                                    path="/admin"
                                    element={
                                        <PrivateRoute adminOnly={true}>
                                            <AdminDashboard />
                                        </PrivateRoute>
                                    }
                                />

                                {/* Redirection pour URLs non trouvées */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </div>

                        <ToastContainer
                            position="top-right"
                            autoClose={5000}
                            hideProgressBar={false}
                            closeOnClick
                            pauseOnHover
                            theme="light"
                        />
                    </div>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;