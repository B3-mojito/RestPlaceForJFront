import React, {createContext, useState, useContext, useEffect} from 'react';
import PropTypes from "prop-types";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    // Check for token in localStorage on initial load
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    }
  }, []);


  const login = (token) => {
    localStorage.setItem('jwtToken', token);
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
  };

  return (
      <AuthContext.Provider value={{ authToken, login, logout }}>
        {children}
      </AuthContext.Provider>
  );
};
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired, // Validate that children is a React node and required
};