import { getCurrentUser } from '@/lib/appwrite/api';
import { IContextType, IUser } from '@/types';
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

export const INTIAL_USER = {
    id: '',
    name: '',
    email: '',
    username: '',
    imageUrl: '',
    bio: ''
};
const INTIAL_STATE = {
    user: INTIAL_USER,
    isLoading: false,
    isAuthenticated: false,
    setUser: () => { },
    setIsAuthenticated: () => { },
    checkAuthUser: async () => false as boolean
};

const AuthContext = createContext<IContextType>(INTIAL_STATE)

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<IUser>(INTIAL_USER);
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate()

    useEffect(() => {
        const cookieFallback = localStorage.getItem('cookieFallback');
        if (cookieFallback === '[]' || cookieFallback === null) {
            navigate('/sign-in');
        } else {
            // Optionally initiate the authentication check if needed
            checkAuthUser();
        }
    }, [navigate]);


    const checkAuthUser = async () => {
        try {
            const currentAccount = await getCurrentUser();

            if (currentAccount) {
                setUser({
                    id: currentAccount.$id,
                    name: currentAccount.name,
                    username: currentAccount.username,
                    email: currentAccount.email,
                    imageUrl: currentAccount.imageUrl,
                    bio: currentAccount.bio
                })

                setIsAuthenticated(true);

                return true;
            } else {
                navigate('/sign-in');
                return false;
            }

        } catch (error) {
            console.log(error);
            return false;
        } finally {
            setIsLoading(false)
        }
    };

    const value = {
        user,
        setUser,
        isLoading,
        isAuthenticated,
        setIsAuthenticated,
        checkAuthUser,
    }
    return (
        <AuthContext.Provider value={value} >
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;

export const useUserContext = () => useContext(AuthContext)