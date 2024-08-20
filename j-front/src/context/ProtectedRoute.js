import React, { useContext } from 'react';
import { Route, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import  {AuthProvider} from "./AuthProvider"; // Adjust the path as needed

const ProtectedRoute = ({ component: Component }) => {
  const { isAuthenticated } = useContext(AuthProvider);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Component />;
};

ProtectedRoute.propTypes = {
  component: PropTypes.elementType.isRequired, // Validate that 'component' is a React component
};

export default ProtectedRoute;
