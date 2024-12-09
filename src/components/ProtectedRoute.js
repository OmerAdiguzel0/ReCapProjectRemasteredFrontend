import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdmin, isLoggedIn } from '../utils/auth';
import { checkTokenExpiration } from '../utils/auth';

function ProtectedRoute({ children, requiredRole }) {
    const userLoggedIn = isLoggedIn() && checkTokenExpiration();
    
    if (!userLoggedIn) {
        return <Navigate to="/login" />;
    }

    if (requiredRole === 'admin' && !isAdmin()) {
        return <Navigate to="/" />;
    }

    return children;
}

export default ProtectedRoute;
