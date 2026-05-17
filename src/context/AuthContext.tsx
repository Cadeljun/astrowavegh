'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useFirebaseAuth } from '@/firebase';
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useFirebaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [auth]);

  const login = async (email: string, password: string) => {
    if (!auth) return;
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('Login error:', err.code);
      
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          setError('Invalid email or password.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Try again later.');
          break;
        default:
          setError('An unexpected error occurred during sign in.');
      }
      throw err;
    }
  };

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  const clearError = () => setError(null);

  // Consider a user an admin if they are logged in (RoleContext handles granular roles)
  const isAdmin = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAdmin,
        login,
        logout,
        clearError
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
