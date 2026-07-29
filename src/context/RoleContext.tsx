'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
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
  const db = useFirestore();
  const [role, setRole] = useState<UserRole>(null);
  const [roleData, setRoleData] = useState<UserRoleData | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    // Check if user is super admin via environment variable
    // This is more secure than hardcoding emails
    const superAdminEmails = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
    if (user?.email && superAdminEmails.includes(user.email)) {
      setRole('SUPER_ADMIN');
      setRoleLoading(false);
      return;
    }

    if (!user || !db) {
      setRole(null);
      setRoleData(null);
      roleLoading !== false && setRoleLoading(false);
      return;
    }

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
        setRole(null);
        setRoleLoading(false);
      }
    );

    return () => unsub();
  }, [user, authLoading, db]);

  // Check if user is super admin via environment variable
  const superAdminEmails = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
  const isSuperAdmin = role === 'SUPER_ADMIN' || (user?.email ? superAdminEmails.includes(user.email) : false);
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
  SUPER_ADMIN: '#00C96B',
  EDITOR:      '#0582FF',
  VIEWER:      '#4A6380',
  DEVELOPER:   '#00D4FF'
};
