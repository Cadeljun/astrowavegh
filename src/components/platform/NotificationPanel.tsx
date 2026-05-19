'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Zap, CheckCircle, XCircle, Star, Award, MessageSquare, Clock } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_CONFIG: Record<string, { icon: any, color: string, border: string }> = {
  booking_request: { icon: MessageSquare, color: 'text-gold', border: 'border-gold' },
  booking_accepted: { icon: CheckCircle, color: 'text-green-500', border: 'border-green-500' },
  booking_declined: { icon: XCircle, color: 'text-red-500', border: 'border-red-500' },
  rating_received: { icon: Star, color: 'text-purple', border: 'border-purple' },
  new_match: { icon: Zap, color: 'text-cyan', border: 'border-cyan' },
  default: { icon: Bell, color: 'text-muted', border: 'border-white/10' }
};

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user || !isOpen) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [user, isOpen]);

  const handleNotifyClick = async (notif: any) => {
    if (!notif.read) {
      await updateDoc(doc(db, 'notifications', notif.id), { read: true });
    }
    if (notif.actionUrl) {
      router.push(notif.actionUrl);
      onClose();
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) {
      await updateDoc(doc(db, 'notifications', n.id), { read: true });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000]"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full max-w-[380px] bg-dark border-l border-white/5 z-[2001] flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-purple" />
                <h2 className="font-display text-xl tracking-widest text-white uppercase">Notifications</h2>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={markAllRead}
                  className="text-[0.6rem] font-bold text-muted hover:text-white uppercase tracking-widest transition-colors"
                >
                  Mark all read
                </button>
                <button onClick={onClose} className="p-1 text-muted hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {loading ? (
                <div className="p-20 text-center animate-pulse"><p className="text-xs text-muted uppercase tracking-[0.2em]">Syncing Feed...</p></div>
              ) : notifications.length > 0 ? (
                <div className="divide-y divide-white/[0.03]">
                  {notifications.map((n) => {
                    const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
                    const Icon = config.icon;
                    return (
                      <div 
                        key={n.id}
                        onClick={() => handleNotifyClick(n)}
                        className={cn(
                          "p-6 flex gap-4 cursor-pointer transition-colors relative group",
                          n.read ? "bg-transparent opacity-60" : "bg-purple/5 hover:bg-purple/10",
                          "border-l-4",
                          config.border
                        )}
                      >
                        <div className={cn("p-2 rounded-lg h-fit bg-white/5", config.color)}>
                          <Icon size={16} />
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <p className={cn("text-sm leading-tight text-white", !n.read && "font-bold")}>{n.title}</p>
                          <p className="text-xs text-muted leading-relaxed line-clamp-2">{n.message}</p>
                          <p className="text-[0.6rem] text-muted/40 uppercase font-bold mt-2 flex items-center gap-1.5">
                            <Clock size={10} />
                            {n.createdAt ? formatDistanceToNow(n.createdAt.toDate()) + ' ago' : 'Just now'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4 opacity-20">
                  <Bell size={64} />
                  <div className="space-y-1">
                    <p className="font-display text-xl tracking-widest uppercase">No Notifications</p>
                    <p className="text-xs">Your personal activity feed is empty.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}