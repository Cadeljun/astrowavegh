'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from './AuthContext';

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'EDITOR'
  | 'VIEWER'
  | 'DEVELOPER'
  | null;

export interface UserRoleData {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  lastLogin: any;
}

interface RoleContextType {
  role: UserRole;
  roleData: UserRoleData | null;
  roleLoading: boolean;
  isSuperAdmin: boolean;
  isEditor: boolean;
  isDeveloper: boolean;
  canWrite: boolean;
  canAccessDev: boolean;
  canEditCMS: boolean;
}

const RoleContext = createContext<RoleContextType>({} as RoleContextType);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [roleData, setRoleData] = useState<UserRoleData | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || authLoading) return;
    
    // Developer Email Bypass - ensure full access even if Firestore doc is missing
    if (user?.email === 'junioraquils143@gmail.com') {
      setRole('SUPER_ADMIN');
      setRoleLoading(false);
      return;
    }

    if (!user || !db.type) {
      setRole(null);
      setRoleData(null);
      setRoleLoading(false);
      return;
    }

    // Listen to user role document in Firestore
    const ref = doc(db, 'user_roles', user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as UserRoleData;
          if (data.active) {
            setRole(data.role);
            setRoleData(data);
          } else {
            setRole(null);
            setRoleData(null);
          }
        } else {
          setRole(null);
          setRoleData(null);
        }
        setRoleLoading(false);
      },
      (error) => {
        console.error('Role fetch error:', error);
        setRole(null);
        setRoleLoading(false);
      }
    );

    return () => unsub();
  }, [user, authLoading]);

  // Permission flags
  const isSuperAdmin = role === 'SUPER_ADMIN' || user?.email === 'junioraquils143@gmail.com';
  const isEditor = isSuperAdmin || role === 'EDITOR';
  const isDeveloper = isSuperAdmin || role === 'DEVELOPER';
  
  const canWrite = isSuperAdmin || (role !== 'VIEWER' && role !== null);
  const canAccessDev = isSuperAdmin || isDeveloper || isEditor;
  const canEditCMS = isSuperAdmin || isEditor;

  return (
    <RoleContext.Provider value={{
      role: isSuperAdmin && !role ? 'SUPER_ADMIN' : role,
      roleData,
      roleLoading,
      isSuperAdmin,
      isEditor,
      isDeveloper,
      canWrite,
      canAccessDev,
      canEditCMS
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used within RoleProvider');
  return context;
};

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  EDITOR: 'Editor',
  VIEWER: 'Viewer',
  DEVELOPER: 'Developer'
};

export const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: '#FFD166',
  EDITOR: '#A855F7',
  VIEWER: '#7B7B9A',
  DEVELOPER: '#06B6D4'
};
