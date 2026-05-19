'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useFirebaseAuth, db } from '@/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { 
  createUserDocument,
  getUserDocument
} from '@/lib/firebase/platform';
import { User as PlatformUser } from '@/types/platform';

interface AuthContextType {
  user: FirebaseUser | null;
  platformUser: PlatformUser | null;
  loading: boolean;
  platformLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  needsOnboarding: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshPlatformUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useFirebaseAuth();
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [platformUser, setPlatformUser] = useState<PlatformUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [platformLoading, setPlatformLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setPlatformLoading(true);
        const pUser = await getUserDocument(currentUser.uid);
        setPlatformUser(pUser);
        setPlatformLoading(false);
      } else {
        setPlatformUser(null);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [auth]);

  const refreshPlatformUser = async () => {
    if (!user) return;
    const pUser = await getUserDocument(user.uid);
    setPlatformUser(pUser);
  };

  const login = async (email: string, password: string) => {
    if (!auth) return;
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const pUser = await getUserDocument(cred.user.uid);
      setPlatformUser(pUser);
      
      if (!pUser || !pUser.onboarded) {
        router.push('/auth/onboarding');
      } else {
        if (pUser.role === 'organizer' || pUser.role === 'both') {
          router.push('/organizer/dashboard');
        } else {
          router.push('/talent/dashboard');
        }
      }
    } catch (err: any) {
      handleAuthError(err);
      throw err;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    if (!auth) return;
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      
      const pUserData: Partial<PlatformUser> = {
        email,
        displayName: name,
        photoURL: '',
        role: null,
        provider: 'email'
      };
      
      await createUserDocument(cred.user.uid, pUserData);
      setPlatformUser(pUserData as PlatformUser);
      router.push('/auth/onboarding');
    } catch (err: any) {
      handleAuthError(err);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) return;
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const cred = await signInWithPopup(auth, provider);
      const existing = await getUserDocument(cred.user.uid);
      
      if (!existing) {
        const newPUser: Partial<PlatformUser> = {
          email: cred.user.email || '',
          displayName: cred.user.displayName || '',
          photoURL: cred.user.photoURL || '',
          role: null,
          provider: 'google'
        };
        await createUserDocument(cred.user.uid, newPUser);
        setPlatformUser(newPUser as PlatformUser);
        router.push('/auth/onboarding');
      } else {
        setPlatformUser(existing);
        if (!existing.onboarded) {
          router.push('/auth/onboarding');
        } else {
          if (existing.role === 'organizer' || existing.role === 'both') {
            router.push('/organizer/dashboard');
          } else {
            router.push('/talent/dashboard');
          }
        }
      }
    } catch (err: any) {
      handleAuthError(err);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    if (!auth) return;
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    if (auth) {
      await signOut(auth);
      setPlatformUser(null);
      router.push('/auth/login');
    }
  };

  const handleAuthError = (err: any) => {
    switch (err.code) {
      case 'auth/user-not-found':
        setError('No account found with this email.');
        break;
      case 'auth/wrong-password':
        setError('Incorrect password.');
        break;
      case 'auth/invalid-credential':
        setError('Invalid email or password.');
        break;
      case 'auth/too-many-requests':
        setError('Too many failed attempts. Try again later.');
        break;
      case 'auth/email-already-in-use':
        setError('This email is already registered.');
        break;
      default:
        setError('An unexpected error occurred.');
    }
  };

  const clearError = () => setError(null);

  const isAdmin = !!user;
  const needsOnboarding = !!user && !!platformUser && !platformUser.onboarded;

  return (
    <AuthContext.Provider
      value={{
        user,
        platformUser,
        loading,
        platformLoading,
        error,
        isAdmin,
        needsOnboarding,
        login,
        register,
        signInWithGoogle,
        resetPassword,
        logout,
        clearError,
        refreshPlatformUser
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
