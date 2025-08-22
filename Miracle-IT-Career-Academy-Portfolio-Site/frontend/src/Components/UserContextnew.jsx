import React, { createContext, useState, useEffect } from 'react';
import { userAxiosInstance } from '../api';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const restoreUser = async () => {
      const access = localStorage.getItem('access');
      if (access) {
        try {
          // Optionally fetch profile to verify token and get user info
          const profile = await userAxiosInstance.get('profile/');
          const role = profile.data.role;
          const username = profile.data.username || null;
          setUser({ role, username });
        } catch (error) {
          console.error('Error restoring user session:', error);
          
          // Only clear tokens if it's an authentication error (401)
          if (error.response && error.response.status === 401) {
            console.log('Authentication error, logging out');
            setUser(null);
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
          } else {
            // For other errors (like network issues), try to keep the user logged in
            // Use token data to create a minimal user object
            try {
              // Parse the JWT token to get basic user info
              const tokenParts = access.split('.');
              if (tokenParts.length === 3) {
                const tokenPayload = tokenParts[1];
                const base64 = tokenPayload.replace(/-/g, '+').replace(/_/g, '/');
                const tokenData = JSON.parse(atob(base64));
                
                // Extract role from token if available, or use a default
                const role = tokenData.role || 'student';
                const username = tokenData.username || 'User';
                console.log('Restored user from token:', { role, username });
                setUser({ role, username });
              }
            } catch (tokenError) {
              console.error('Failed to parse token:', tokenError);
              // Don't clear tokens on token parsing error
              // This allows the token refresh mechanism to try again later
            }
          }
        }
      }
    };
    restoreUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
