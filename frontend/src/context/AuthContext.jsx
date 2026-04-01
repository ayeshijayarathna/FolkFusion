import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, artistAPI, adminAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  //check if user is already logged in 
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // verify token is still valid
          const response = await authAPI.getMe();
          const userData = response.data.data;

          // fetch complete profile with profilePhoto
          let completeUserData = { ...userData };

          try {
            if (userData.role === 'artist') {
              const profileRes = await artistAPI.getMyProfile();
              const artistProfile = profileRes.data.data;
              
              completeUserData = {
                ...userData,
                fullName: artistProfile.fullName || userData.email,
                profileImage: artistProfile.profilePhoto || 
                             artistProfile.profileImage?.url || 
                             artistProfile.profileImage || 
                             null,
                bio: artistProfile.bio || '',
                specialization: artistProfile.specialization || [],
                phoneNumber: artistProfile.phoneNumber || '',
              };
            } else if (userData.role === 'admin') {
              const profileRes = await adminAPI.getMyProfile();
              const adminProfile = profileRes.data.data;
              
              completeUserData = {
                ...userData,
                fullName: adminProfile.fullName || userData.email,
                profileImage: adminProfile.profilePhoto || 
                             adminProfile.profileImage?.url || 
                             adminProfile.profileImage || 
                             null,
                phoneNumber: adminProfile.phoneNumber || '',
              };
            }
          } catch (profileError) {
            console.error('Error fetching profile:', profileError);
          }

          setUser(completeUserData);
          setIsAuthenticated(true);
          
          // update localStorage with complete data
          localStorage.setItem('user', JSON.stringify(completeUserData));
        } catch (error) {
          // token invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, data } = response.data;
      
      // save token
      localStorage.setItem('token', token);
      
      const userData = data.user;

      //fetch complete profile with profilePhoto after login
      let completeUserData = { ...userData };

      try {
        if (userData.role === 'artist') {
          const profileRes = await artistAPI.getMyProfile();
          const artistProfile = profileRes.data.data;
          
          completeUserData = {
            ...userData,
            fullName: artistProfile.fullName || userData.email,
            profileImage: artistProfile.profilePhoto || 
                         artistProfile.profileImage?.url || 
                         artistProfile.profileImage || 
                         null,
            bio: artistProfile.bio || '',
            specialization: artistProfile.specialization || [],
            province: artistProfile.province || userData.province,
            phoneNumber: artistProfile.phoneNumber || '',
          };
        } else if (userData.role === 'admin') {
          const profileRes = await adminAPI.getMyProfile();
          const adminProfile = profileRes.data.data;
          
          completeUserData = {
            ...userData,
            fullName: adminProfile.fullName || userData.email,
            profileImage: adminProfile.profilePhoto || 
                         adminProfile.profileImage?.url || 
                         adminProfile.profileImage || 
                         null,
            province: adminProfile.province || userData.province,
            phoneNumber: adminProfile.phoneNumber || '',
          };
        }
      } catch (profileError) {
        console.error('Error fetching profile after login:', profileError);
      }

      // save complete user data
      localStorage.setItem('user', JSON.stringify(completeUserData));
      
      // update state
      setUser(completeUserData);
      setIsAuthenticated(true);
      
      return { success: true, user: completeUserData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  //method to refresh user data from server
  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe();
      const userData = response.data.data;

      let completeUserData = { ...userData };

      try {
        if (userData.role === 'artist') {
          const profileRes = await artistAPI.getMyProfile();
          const artistProfile = profileRes.data.data;
          
          completeUserData = {
            ...userData,
            fullName: artistProfile.fullName || userData.email,
            profileImage: artistProfile.profilePhoto || 
                         artistProfile.profileImage?.url || 
                         artistProfile.profileImage || 
                         null,
            bio: artistProfile.bio || '',
            specialization: artistProfile.specialization || [],
          };
        } else if (userData.role === 'admin') {
          const profileRes = await adminAPI.getMyProfile();
          const adminProfile = profileRes.data.data;
          
          completeUserData = {
            ...userData,
            fullName: adminProfile.fullName || userData.email,
            profileImage: adminProfile.profilePhoto || 
                         adminProfile.profileImage?.url || 
                         adminProfile.profileImage || 
                         null,
          };
        }
      } catch (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      setUser(completeUserData);
      localStorage.setItem('user', JSON.stringify(completeUserData));
      
      return completeUserData;
    } catch (error) {
      console.error('Refresh user failed:', error);
      return null;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    refreshUser, 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;