'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { auth } from '@/firebase';
import { useRouter } from 'next/navigation';
import {
  createUserDocument,
  getUserDocument
} from '@/lib/firebase/platform';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  platformUser: any | null;
  platformLoading: boolean;
  isAdmin: boolean;
  needsOnboarding: boolean;
  login: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [platformUser, setPlatformUser] = useState<any | null>(null);
  const [platformLoading, setPlatformLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);

        if (firebaseUser) {
          try {
            const doc = await getUserDocument(firebaseUser.uid);
            setPlatformUser(doc);
          } catch (err) {
            setPlatformUser(null);
          } finally {
            setPlatformLoading(false);
          }
        } else {
          setPlatformUser(null);
          setPlatformLoading(false);
        }
      },
      () => {
        setLoading(false);
        setPlatformLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin/dashboard');
    } catch (err: any) {
      const msgs: Record<string, string> = {
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/too-many-requests': 'Too many attempts. Try again later.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/user-disabled': 'This account has been disabled.'
      };
      setError(msgs[err.code] || 'Sign in failed. Please try again.');
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const existing = await getUserDocument(firebaseUser.uid);

      if (!existing) {
        await createUserDocument(firebaseUser.uid, {
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          role: null,
          provider: 'google',
          onboarded: false,
          active: true
        });
        router.push('/auth/onboarding');
      } else if (!existing.onboarded) {
        router.push('/auth/onboarding');
      } else {
        if (existing.role === 'organizer' || existing.role === 'both') {
          router.push('/organizer/dashboard');
        } else if (existing.role === 'talent') {
          router.push('/talent/dashboard');
        } else {
          router.push('/auth/onboarding');
        }
      }
    } catch (err: any) {
      const messages: Record<string, string> = {
        'auth/popup-closed-by-user': 'Sign in cancelled. Try again.',
        'auth/popup-blocked': 'Popup blocked. Allow popups and try again.',
        'auth/cancelled-popup-request': 'Sign in cancelled.',
        'auth/network-request-failed': 'Network error. Check your connection.',
        'auth/unauthorized-domain': 'This domain is not authorised. Contact support.'
      };
      setError(messages[err.code] || 'Something went wrong. Please try again.');
    }
  };

  const logout = async () => {
    await signOut(auth);
    setPlatformUser(null);
    router.push('/');
  };

  const clearError = () => setError(null);

  const isAdmin = !!user;
  const needsOnboarding = !!user && !!platformUser && !platformUser.onboarded;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      platformUser,
      platformLoading,
      isAdmin,
      needsOnboarding,
      login,
      signInWithGoogle,
      logout,
      error,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
