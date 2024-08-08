import React, { useContext } from 'react';
import {Route, Navigate} from 'react-router-dom';
import {AuthContext} from "./AuthProvider";
import PropTypes from "prop-types"; // Adjust path as needed

const ProtectedRoute = ({ component: Component }) => {
  const { authToken } = useContext(AuthContext);

  if (!authToken) {
    return <Navigate to="/login" />;
  }

  return <Component />;
};
ProtectedRoute.propTypes = {
  component: PropTypes.elementType.isRequired, // Validate that 'component' is a React component
};
export default ProtectedRoute;