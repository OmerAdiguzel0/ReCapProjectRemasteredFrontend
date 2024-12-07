import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdmin, isLoggedIn } from '../utils/auth';

function ProtectedRoute({ children, requiredRole }) {
  console.group('Protected Route Check');
  
  const userLoggedIn = isLoggedIn();
  console.log('User logged in:', userLoggedIn);
  
  if (!userLoggedIn) {
    console.log('No token found, redirecting to login');
    console.groupEnd();
    return <Navigate to="/login" />;
  }

  if (requiredRole === 'admin' && !isAdmin()) {
    console.log('Admin access required but user is not admin');
    console.groupEnd();
    return <Navigate to="/" />;
  }

  console.log('Access granted');
  console.groupEnd();
  return children;
}

export default ProtectedRoute;
