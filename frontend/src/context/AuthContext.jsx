// import React, { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios';
// import { googleLogout } from '@react-oauth/google';
// import { jwtDecode } from "jwt-decode";


// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);

//     // Configure Axios base URL
//     const api = axios.create({
//         baseURL: 'http://localhost:3000', // Adjust if backend port differs
//     });

//     // Add token to headers
//     api.interceptors.request.use((config) => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     });

//     useEffect(() => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             try {
//                 const decoded = jwtDecode(token);
//                 // Check expiry?
//                 if (decoded.exp * 1000 < Date.now()) {
//                     logout();
//                 } else {
//                     // Ideally fetch profile from backend to get full user object
//                     // For now, use decoded or stored user
//                     const storedUser = localStorage.getItem('user');
//                     setUser(storedUser ? JSON.parse(storedUser) : { id: decoded.sub, email: decoded.email, role: decoded.role });
//                 }
//             } catch (e) {
//                 logout();
//             }
//         }
//         setLoading(false);
//     }, []);

//     const storeAuth = (token, user) => {
//         localStorage.setItem('token', token);
//         localStorage.setItem('user', JSON.stringify(user));
//         setUser(user);
//         api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//     };

//     const loginWithGoogle = async (idToken) => {
//         const res = await api.post('/auth/google-login', { token: idToken });
//         const { access_token, user } = res.data;
//         storeAuth(access_token, user);
//         return user;
//     };

//     const sendEmailOtp = async (email) => {
//         await api.post('/auth/send-email-otp', { email });
//     };

//     const verifyEmailOtp = async (email, otp) => {
//         const res = await api.post('/auth/verify-email-otp', { email, otp });
//         const { access_token, user } = res.data;
//         storeAuth(access_token, user);
//         return user;
//     };

//     const loginWithPassword = async (email, password) => {
//         const res = await api.post('/auth/login', { email, password });
//         const { access_token, user } = res.data;
//         storeAuth(access_token, user);
//         return user;
//     };

//     const loginAsGuest = async () => {
//         const res = await api.post('/auth/guest-login');
//         const { access_token, user } = res.data;
//         storeAuth(access_token, user);
//         return user;
//     };

//     const registerWithPassword = async (data) => {
//         const res = await api.post('/auth/register', data);
//         return res.data;
//     };

//     const checkUsername = async (username) => {
//         try {
//             const res = await axios.get(`http://localhost:3000/users/check-username?username=${username}`);
//             return res.data.available;
//         } catch (e) {
//             console.error(e);
//             return false;
//         }
//     };

//     const checkEmail = async (email) => {
//         try {
//             const res = await axios.get(`http://localhost:3000/users/check-email?email=${email}`);
//             return res.data.available;
//         } catch (e) {
//             console.error(e);
//             return false;
//         }
//     };

//     const resetPassword = async (email, newPassword, resetToken) => {
//         await api.post('/auth/reset-password', { email, newPassword, resetToken });
//     };

//     const logout = () => {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         setUser(null);
//         try {
//             googleLogout();
//         } catch (e) {
//             console.error("Google logout failed", e);
//         }
//         delete api.defaults.headers.common['Authorization'];
//     };

//     const verifyOtpCheck = async (email, otp) => {
//         try {
//             const res = await api.post('/auth/verify-otp-check', { email, otp });
//             return { valid: res.data.valid, resetToken: res.data.resetToken };
//         } catch (e) {
//             console.error(e);
//             return { valid: false };
//         }
//     };

//     const value = {
//         user,
//         loading,
//         loginWithGoogle,
//         sendEmailOtp,
//         verifyEmailOtp,
//         loginWithPassword,
//         loginAsGuest,
//         register: registerWithPassword,
//         logout,
//         checkUsername,
//         checkEmail,
//         verifyOtpCheck,
//         resetPassword
//     };

//     return (
//         <AuthContext.Provider value={value}>
//             {loading ? <div className="loading-spinner">Loading...</div> : children}
//         </AuthContext.Provider>
//     );
// };


import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Axios instance
    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    });

    // Attach token to every request
    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // Load user from localStorage on refresh
    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const decoded = jwtDecode(token);

                // Token expired
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    const storedUser = localStorage.getItem('user');
                    setUser(
                        storedUser
                            ? JSON.parse(storedUser)
                            : {
                                id: decoded.sub,
                                email: decoded.email,
                                role: decoded.role,
                            }
                    );
                }
            } catch (error) {
                logout();
            }
        }

        setLoading(false);
    }, []);

    // Save auth data
    const storeAuth = (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    // ---------- AUTH METHODS ----------

    const loginWithGoogle = async (idToken) => {
        const res = await api.post('/auth/google-login', { token: idToken });
        const { access_token, user } = res.data;
        storeAuth(access_token, user);
        return user;
    };

    const sendEmailOtp = async (email) => {
        await api.post('/auth/send-email-otp', { email });
    };

    const verifyEmailOtp = async (email, otp) => {
        const res = await api.post('/auth/verify-email-otp', { email, otp });
        const { access_token, user } = res.data;
        storeAuth(access_token, user);
        return user;
    };

    const loginWithPassword = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { access_token, user } = res.data;
        storeAuth(access_token, user);
        return user;
    };

    const loginAsGuest = async () => {
        const res = await api.post('/auth/guest-login');
        const { access_token, user } = res.data;
        storeAuth(access_token, user);
        return user;
    };

    const registerWithPassword = async (data) => {
        const res = await api.post('/auth/register', data);
        return res.data;
    };

    // ---------- VALIDATION ----------

    const checkUsername = async (username) => {
        try {
            const res = await api.get(
                `/users/check-username?username=${username}`
            );
            return res.data.available;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const checkEmail = async (email) => {
        try {
            const res = await api.get(
                `/users/check-email?email=${email}`
            );
            return res.data.available;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const checkOtp = async (email, otp) => {
        try {
            const res = await api.post('/auth/check-otp', { email, otp });
            return res.data;
        } catch (error) {
            console.error(error);
            return { valid: false };
        }
    };

    // ---------- PASSWORD RESET ----------

    const verifyOtpCheck = async (email, otp) => {
        try {
            const res = await api.post('/auth/verify-otp-check', { email, otp });
            return {
                valid: res.data.valid,
                resetToken: res.data.resetToken,
            };
        } catch (error) {
            console.error(error);
            return { valid: false };
        }
    };

    const resetPassword = async (email, newPassword, resetToken) => {
        await api.post('/auth/reset-password', {
            email,
            newPassword,
            resetToken,
        });
    };

    // ---------- LOGOUT ----------
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);

        try {
            googleLogout();
        } catch (error) {
            console.error('Google logout failed', error);
        }

        delete api.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        loading,
        loginWithGoogle,
        sendEmailOtp,
        verifyEmailOtp,
        loginWithPassword,
        loginAsGuest,
        register: registerWithPassword,
        logout,
        checkUsername,
        checkEmail,
        checkOtp,
        verifyOtpCheck,
        resetPassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <div className="loading-spinner">Loading...</div> : children}
        </AuthContext.Provider>
    );
};
