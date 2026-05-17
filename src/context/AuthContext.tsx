'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/firebase/config';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isDeveloper: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent listening if auth is not initialized
    if (!auth || typeof auth.onAuthStateChanged !== 'function') {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    
    if (!auth || typeof auth.app === 'undefined') {
      setError('Firebase is not properly configured. Please check your settings.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect credentials. Please try again.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No admin account found.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Try later.');
      } else if (err.code === 'auth/api-key-not-valid') {
        setError('Firebase API Key is invalid.');
      } else {
        setError('Authentication failed. Please check your credentials.');
      }
      throw err;
    }
  };

  const logout = async () => {
    if (auth && typeof auth.signOut === 'function') {
      await signOut(auth);
    }
  };

  const isAdmin = !!user;
  const isDeveloper = user?.email === 'junioraquils143@gmail.com';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAdmin,
        isDeveloper,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
