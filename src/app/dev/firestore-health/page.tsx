'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, XCircle, AlertTriangle, Loader2, 
  Play, RefreshCw, Database, Shield, Key, Server,
  Clock
} from 'lucide-react';
import { collection, getDocs, addDoc, deleteDoc, doc, limit, query } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

type CheckStatus = 'pass' | 'fail' | 'warning' | 'pending' | 'running';

interface HealthCheck {
  id: string;
  name: string;
  description: string;
  status: CheckStatus;
  message: string;
  details?: string;
}

const REQUIRED_COLLECTIONS = ['events', 'talent_profiles', 'users', 'bookings', 'ratings', 'contacts', 'waitlist'];

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

export default function FirestoreHealthPage() {
  const { user } = useAuth();
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const HEALTH_PASSWORD = 'AstroWave2025';

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === HEALTH_PASSWORD) {
      setAuthenticated(true);
    }
  };

  const updateCheck = (id: string, updates: Partial<HealthCheck>) => {
    setChecks(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const runHealthChecks = async () => {
    setRunning(true);
    setLastRun(new Date().toLocaleString());

    // Initialize checks
    const initialChecks: HealthCheck[] = [
      { id: 'connection', name: 'Firestore Connection', description: 'Can we connect to Firestore?', status: 'running', message: 'Testing...' },
      { id: 'collections', name: 'Required Collections', description: 'Do all required collections exist?', status: 'running', message: 'Checking...' },
      { id: 'read', name: 'Read Permissions', description: 'Can we read from collections?', status: 'running', message: 'Testing...' },
      { id: 'write', name: 'Write Permissions', description: 'Can we write to Firestore?', status: 'running', message: 'Testing...' },
      { id: 'auth', name: 'Authentication', description: 'Is Firebase Auth working?', status: 'running', message: 'Checking...' },
      { id: 'env', name: 'Environment Variables', description: 'Are all required env vars set?', status: 'running', message: 'Checking...' },
    ];
    setChecks(initialChecks);

    // Check 1: Firestore Connection
    try {
      const testQuery = query(collection(db, 'events'), limit(1));
      await getDocs(testQuery);
      updateCheck('connection', { status: 'pass', message: 'Connected successfully' });
    } catch (error: any) {
      updateCheck('connection', { status: 'fail', message: 'Connection failed', details: error.message });
    }

    // Check 2: Required Collections
    try {
      const missingCollections: string[] = [];
      const emptyCollections: string[] = [];

      for (const colName of REQUIRED_COLLECTIONS) {
        try {
          const snap = await getDocs(query(collection(db, colName), limit(1)));
          if (snap.empty) {
            emptyCollections.push(colName);
          }
        } catch {
          missingCollections.push(colName);
        }
      }

      if (missingCollections.length > 0) {
        updateCheck('collections', { 
          status: 'fail', 
          message: `Missing: ${missingCollections.join(', ')}`,
          details: `${missingCollections.length} collections inaccessible`
        });
      } else if (emptyCollections.length > 0) {
        updateCheck('collections', { 
          status: 'warning', 
          message: `Empty: ${emptyCollections.join(', ')}`,
          details: `${emptyCollections.length} collections have no documents`
        });
      } else {
        updateCheck('collections', { 
          status: 'pass', 
          message: `All ${REQUIRED_COLLECTIONS.length} collections exist and have data`
        });
      }
    } catch (error: any) {
      updateCheck('collections', { status: 'fail', message: 'Check failed', details: error.message });
    }

    // Check 3: Read Permissions
    try {
      await getDocs(query(collection(db, 'events'), limit(1)));
      await getDocs(query(collection(db, 'talent_profiles'), limit(1)));
      updateCheck('read', { status: 'pass', message: 'Read access working for events and talent_profiles' });
    } catch (error: any) {
      updateCheck('read', { status: 'fail', message: 'Read permission denied', details: error.message });
    }

    // Check 4: Write Permissions
    try {
      const testDoc = await addDoc(collection(db, '_health_test'), {
        test: true,
        timestamp: new Date().toISOString(),
        purpose: 'Health check - safe to delete'
      });
      
      // Clean up
      await deleteDoc(doc(db, '_health_test', testDoc.id));
      
      updateCheck('write', { status: 'pass', message: 'Write and delete successful' });
    } catch (error: any) {
      const isPermissionDenied = error.code === 'permission-denied' || error.message?.includes('permission');
      updateCheck('write', { 
        status: isPermissionDenied ? 'warning' : 'fail', 
        message: isPermissionDenied ? 'Write blocked by security rules (expected for public)' : 'Write failed',
        details: error.message
      });
    }

    // Check 5: Authentication
    try {
      if (user) {
        updateCheck('auth', { 
          status: 'pass', 
          message: `Authenticated as ${user.email}`,
          details: `UID: ${user.uid}`
        });
      } else {
        updateCheck('auth', { 
          status: 'warning', 
          message: 'No user signed in',
          details: 'Some features may not work without authentication'
        });
      }
    } catch (error: any) {
      updateCheck('auth', { status: 'fail', message: 'Auth check failed', details: error.message });
    }

    // Check 6: Environment Variables
    try {
      const missingVars: string[] = [];
      const presentVars: string[] = [];

      for (const varName of REQUIRED_ENV_VARS) {
        const value = process.env[varName];
        if (!value || value === 'undefined') {
          missingVars.push(varName);
        } else {
          presentVars.push(varName);
        }
      }

      if (missingVars.length > 0) {
        updateCheck('env', { 
          status: 'fail', 
          message: `Missing: ${missingVars.length} variables`,
          details: missingVars.join(', ')
        });
      } else {
        updateCheck('env', { 
          status: 'pass', 
          message: `All ${REQUIRED_ENV_VARS.length} env vars configured`
        });
      }
    } catch (error: any) {
      updateCheck('env', { status: 'fail', message: 'Check failed', details: error.message });
    }

    setRunning(false);
  };

  const summary = checks.length > 0 ? {
    pass: checks.filter(c => c.status === 'pass').length,
    fail: checks.filter(c => c.status === 'fail').length,
    warning: checks.filter(c => c.status === 'warning').length,
    total: checks.length,
    allPass: checks.every(c => c.status === 'pass'),
    hasIssues: checks.some(c => c.status === 'fail' || c.status === 'warning'),
  } : null;

  // Password gate
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020B18] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <Database size={32} className="mx-auto mb-4 text-green" />
            <h1 className="font-display text-2xl text-white uppercase">Health Check</h1>
            <p className="text-muted text-sm mt-1">Enter access password</p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-border-dark text-white focus:border-green outline-none"
              placeholder="Password"
            />
            <button type="submit" className="w-full h-12 rounded-lg bg-green text-black font-bold uppercase tracking-widest">
              Access
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white uppercase tracking-wider">Firestore Health</h1>
          <p className="text-muted text-sm mt-1">Comprehensive database health check</p>
        </div>
        <button
          onClick={runHealthChecks}
          disabled={running}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green text-black font-bold text-sm uppercase tracking-widest hover:bg-green/90 transition-all disabled:opacity-50"
        >
          {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {running ? 'Running...' : 'Run Health Check'}
        </button>
      </div>

      {/* Summary */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-6 rounded-xl border",
            summary.allPass ? "bg-green/5 border-green/20" : 
            summary.hasIssues ? "bg-yellow-500/5 border-yellow-500/20" : 
            "bg-white/5 border-white/10"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {summary.allPass ? (
                <CheckCircle size={32} className="text-green" />
              ) : summary.hasIssues ? (
                <AlertTriangle size={32} className="text-yellow-500" />
              ) : (
                <Database size={32} className="text-muted" />
              )}
              <div>
                <h2 className="font-display text-xl text-white uppercase">
                  {summary.allPass ? 'All Systems Operational' : 'Issues Detected'}
                </h2>
                <p className="text-muted text-sm">
                  {summary.pass} passed • {summary.warning} warnings • {summary.fail} failed
                </p>
              </div>
            </div>
            {lastRun && (
              <div className="flex items-center gap-2 text-muted text-sm">
                <Clock size={14} />
                {lastRun}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Checks */}
      {checks.length > 0 && (
        <div className="space-y-4">
          {checks.map((check, index) => (
            <motion.div
              key={check.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 rounded-xl border border-white/10 bg-white/[0.02]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    {check.status === 'pass' && <CheckCircle size={20} className="text-green" />}
                    {check.status === 'fail' && <XCircle size={20} className="text-red-500" />}
                    {check.status === 'warning' && <AlertTriangle size={20} className="text-yellow-500" />}
                    {check.status === 'running' && <Loader2 size={20} className="animate-spin text-blue-400" />}
                    {check.status === 'pending' && <Clock size={20} className="text-muted" />}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{check.name}</h3>
                    <p className="text-muted text-sm mt-1">{check.description}</p>
                    <p className={cn(
                      "text-sm mt-2 font-medium",
                      check.status === 'pass' && "text-green",
                      check.status === 'fail' && "text-red-400",
                      check.status === 'warning' && "text-yellow-400",
                      check.status === 'running' && "text-blue-400",
                    )}>
                      {check.message}
                    </p>
                    {check.details && (
                      <p className="text-muted/60 text-xs mt-1 font-mono">{check.details}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {checks.length === 0 && !running && (
        <div className="text-center py-20">
          <Database size={48} className="mx-auto text-muted/30 mb-4" />
          <p className="text-muted text-sm">Click "Run Health Check" to start</p>
        </div>
      )}
    </div>
  );
}
