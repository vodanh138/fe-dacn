import { Navigate } from 'react-router-dom';
import React from 'react';
import propTypes from 'prop-types';

function PrivateRoute({ children }) {
  const userStr = sessionStorage.getItem('user');
  if (!userStr)
    <Navigate to="/login" />
  const jsonuser = JSON.parse(userStr);
  const token = jsonuser?.access_token;
  return token ? children : <Navigate to="/login" />;
}

PrivateRoute.propTypes = {
  children: propTypes.node
};

export { PrivateRoute };
