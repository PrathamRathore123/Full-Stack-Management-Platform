import React, { createContext, useState, useEffect, useRef } from 'react';
import { userAxiosInstance, adminAxiosInstance } from '../api';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  // Initialize user as null instead of with hardcoded values
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const effectRan = useRef(false);

  useEffect(() => {
    // Don't use effectRan for this effect - we want it to run on every mount
    // to restore the user session properly
    let isMounted = true;
    
    const restoreUser = async () => {
      const access = localStorage.getItem('access');
      const role = localStorage.getItem('role');
      const username = localStorage.getItem('username');
      // console.log('Restoring user session, access token:', access);
      
      // Immediately set user from localStorage to prevent flashing of login page
      if (access && role && username) {
        setUser({ role, username });
      }
      
      if (access) {
        try {
          // Fetch profile from API with increased timeout
          const profilePromise = userAxiosInstance.get('profile/', { timeout: 8000 });
          const profile = await profilePromise;
          
          console.log('Profile fetched:', profile.data);
          const fetchedUsername = profile.data.username || username;
          const fetchedRole = profile.data.role || role;
          
          // Store in localStorage for future use
          localStorage.setItem('role', fetchedRole);
          localStorage.setItem('username', fetchedUsername);
          
          // Update adminAxiosInstance with the token
          adminAxiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;
          
          if (isMounted) {
            setUser({ role: fetchedRole, username: fetchedUsername });
            console.log('User updated in context:', { role: fetchedRole, username: fetchedUsername });
          }
        } catch (error) {
          console.error('Error restoring user session:', error);
          // Only clear tokens if it's an authentication error (401), not for network issues
          if (error.response?.status === 401) {
            console.log('Authentication error, clearing tokens');
            localStorage.removeItem('access');
            localStorage.removeItem('role');
            setUser(null);
          } else {
            // For network errors or timeouts, keep the user logged in with stored role
            console.log('Network error or timeout, using stored credentials');
            // We already set the user from localStorage above, so no need to do it again
          }
        }
      } else {
        // No access token found - user is not logged in (normal for public pages)
        setUser(null);
      }
    };
    
    restoreUser();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
