'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react'
import { doc, onSnapshot } from 
  'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuth } from './AuthContext'

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'EDITOR'
  | 'VIEWER'
  | 'DEVELOPER'
  | null

export interface UserRoleData {
  uid: string
  email: string
  name: string
  role: UserRole
  active: boolean
  lastLogin: any
}

interface RoleContextType {
  role: UserRole
  roleData: UserRoleData | null
  roleLoading: boolean
  isSuperAdmin: boolean
  isEditor: boolean
  isViewer: boolean
  isDeveloper: boolean
  canWrite: boolean
  canAccessAdmin: boolean
  canAccessDev: boolean
  canEditCMS: boolean
}

const RoleContext = createContext<RoleContextType>({} as RoleContextType)

export function RoleProvider({
  children
}: {
  children: ReactNode
}) {
  const { user, loading: authLoading } = 
    useAuth()
  const [role, setRole] = 
    useState<UserRole>(null)
  const [roleData, setRoleData] = 
    useState<UserRoleData | null>(null)
  const [roleLoading, setRoleLoading] = 
    useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setRole(null)
      setRoleData(null)
      setRoleLoading(false)
      return
    }

    // Listen to user role document
    const ref = doc(
      db, 'user_roles', user.uid
    )
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as 
            UserRoleData
          if (data.active) {
            setRole(data.role)
            setRoleData(data)
          } else {
            // Account deactivated
            setRole(null)
            setRoleData(null)
          }
        } else {
          // No role document — deny access
          setRole(null)
          setRoleData(null)
        }
        setRoleLoading(false)
      },
      (error) => {
        console.error(
          'Role fetch error:', error
        )
        setRole(null)
        setRoleLoading(false)
      }
    )

    return () => unsub()
  }, [user, authLoading])

  // Permission flags
  const isSuperAdmin = role === 'SUPER_ADMIN'
  const isEditor = 
    role === 'SUPER_ADMIN' || 
    role === 'EDITOR'
  const isViewer = role === 'VIEWER'
  const isDeveloper = 
    role === 'SUPER_ADMIN' || 
    role === 'DEVELOPER'
  const canWrite = role !== 'VIEWER' && 
    role !== null
  const canAccessAdmin = 
    role === 'SUPER_ADMIN'
  const canAccessDev = 
    role === 'SUPER_ADMIN' || 
    role === 'DEVELOPER' || 
    role === 'EDITOR'
  const canEditCMS = 
    role === 'SUPER_ADMIN' || 
    role === 'EDITOR'

  return (
    <RoleContext.Provider value={{
      role,
      roleData,
      roleLoading,
      isSuperAdmin,
      isEditor,
      isViewer,
      isDeveloper,
      canWrite,
      canAccessAdmin,
      canAccessDev,
      canEditCMS
    }}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error(
      'useRole must be used within RoleProvider'
    )
  }
  return context
}

// Role display helpers
export const ROLE_LABELS: 
  Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  EDITOR:      'Editor',
  VIEWER:      'Viewer',
  DEVELOPER:   'Developer'
}

export const ROLE_COLORS: 
  Record<string, string> = {
  SUPER_ADMIN: '#FFD166',
  EDITOR:      '#A855F7',
  VIEWER:      '#7B7B9A',
  DEVELOPER:   '#06B6D4'
}

export const ROLE_DESCRIPTIONS: 
  Record<string, string> = {
  SUPER_ADMIN: 
    'Full access to everything',
  EDITOR:      
    'Can edit CMS content only',
  VIEWER:      
    'Read-only access, cannot save',
  DEVELOPER:   
    'Dev panel access only'
}