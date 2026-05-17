'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  limit,
  orderBy,
  Timestamp,
  addDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { 
  Database, 
  Search, 
  Plus, 
  Trash2, 
  Copy, 
  Edit3, 
  Save, 
  Download, 
  Upload, 
  X, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Code,
  FileJson,
  Hash,
  RefreshCw,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const COLLECTIONS = [
  'events', 'talent', 'contacts', 'waitlist', 'talent_inquiries', 'gallery', 'uploads', 'cms_content', 'cms_settings', 'user_roles'
];

export default function FirestoreDevPage() {
  const { toast } = useToast();
  const [selectedCol, setSelectedCol] = useState(COLLECTIONS[0]);
  const [customCol, setCustomCol] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingDoc, setEditDoc] = useState<any>(null);
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [search, setSearch] = useState('');

  const activeCollection = customCol || selectedCol;

  const fetchDocs = async () => {
    if (!activeCollection) return;
    setLoading(true);
    try {
      const q = query(collection(db, activeCollection), limit(50));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDocuments(data);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Fetch Failed', description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [selectedCol, customCol]);

  const handleSave = async (docId: string, data: any) => {
    setLoading(true);
    try {
      const cleanData = { ...data };
      delete cleanData.id;
      
      // If in JSON mode, parse the input
      let finalData = cleanData;
      if (isJsonMode) {
        finalData = JSON.parse(jsonInput);
      }

      await setDoc(doc(db, activeCollection, docId), {
        ...finalData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      toast({ title: 'Document Saved' });
      setEditDoc(null);
      fetchDocs();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Save Failed', description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, activeCollection, docId));
      toast({ title: 'Document Deleted' });
      fetchDocs();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Delete Failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (data: any) => {
    setLoading(true);
    try {
      const newData = { ...data };
      delete newData.id;
      await addDoc(collection(db, activeCollection), {
        ...newData,
        createdAt: serverTimestamp()
      });
      toast({ title: 'Document Duplicated' });
      fetchDocs();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Duplicate Failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(documents, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `astrowave_${activeCollection}_export.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) throw new Error('File must be a JSON array of documents.');
        
        setLoading(true);
        const batch = writeBatch(db);
        json.forEach(item => {
          const docRef = item.id ? doc(db, activeCollection, item.id) : doc(collection(db, activeCollection));
          const data = { ...item };
          delete data.id;
          batch.set(docRef, data, { merge: true });
        });
        
        await batch.commit();
        toast({ title: 'Import Complete', description: `Successfully imported ${json.length} documents.` });
        fetchDocs();
      } catch (e: any) {
        toast({ variant: 'destructive', title: 'Import Failed', description: e.message });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const startEdit = (doc: any) => {
    setEditDoc(doc);
    setJsonInput(JSON.stringify(doc, (k, v) => v instanceof Timestamp ? v.toDate() : v, 2));
    setIsJsonMode(false);
  };

  const filteredDocs = documents.filter(d => 
    JSON.stringify(d).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <SectionHeading 
        label="CORE INFRASTRUCTURE"
        title="FIRESTORE MANAGER"
        subtitle="Full administrative control over your production data environment."
      />

      {/* Toolbar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 p-6 space-y-4" glowColor="muted">
          <p className="admin-label text-[0.6rem]">COLLECTION SELECTOR</p>
          <div className="space-y-2">
            <select 
              className="admin-input h-11"
              value={selectedCol}
              onChange={e => { setSelectedCol(e.target.value); setCustomCol(''); }}
            >
              {COLLECTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="relative">
              <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input 
                type="text" 
                placeholder="Custom path..." 
                className="admin-input h-11 pl-9"
                value={customCol}
                onChange={e => setCustomCol(e.target.value)}
              />
            </div>
          </div>
          <Button variant="secondary" className="w-full h-11 border-white/5" onClick={fetchDocs} disabled={loading}>
            <RefreshCw size={14} className={cn("mr-2", loading && "animate-spin")} /> RELOAD
          </Button>
        </Card>

        <Card className="lg:col-span-3 p-6 flex flex-col justify-between" glowColor="muted">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input 
                type="text" 
                placeholder="Filter documents in view..." 
                className="admin-input h-12 pl-12"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => startEdit({ id: 'NEW_DOC_' + Math.random().toString(36).substr(2, 5) })} className="h-12 px-6">
                <Plus size={18} className="mr-2" /> NEW DOC
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-12 w-12 border border-white/5 p-0">
                    <MoreVertical size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-dark border-white/10 text-white">
                  <DropdownMenuItem onClick={handleExport} className="cursor-pointer gap-2">
                    <Download size={14} /> Export Collection
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer p-0">
                    <label className="flex items-center gap-2 px-2 py-1.5 w-full cursor-pointer">
                      <Upload size={14} /> Import JSON
                      <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                    </label>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[0.65rem] text-muted font-mono uppercase tracking-[0.2em]">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            Active Collection: <span className="text-white">{activeCollection}</span>
            <span className="ml-auto">{filteredDocs.length} documents found</span>
          </div>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && documents.length === 0 ? (
          [1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-white/5 animate-pulse rounded-lg border border-white/5" />)
        ) : filteredDocs.map((doc) => (
          <Card key={doc.id} className="p-6 flex flex-col bg-[#0A0A0F] border-white/5 hover:border-white/20 transition-all group" glowColor="muted">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1 min-w-0">
                <p className="font-mono text-[0.6rem] text-gold uppercase font-bold tracking-widest">ID: {doc.id}</p>
                <h4 className="text-white font-bold truncate pr-4">{doc.name || doc.title || doc.email || 'Untitled Document'}</h4>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(doc)} className="p-2 hover:bg-white/10 rounded-sm text-cyan transition-colors" title="Edit"><Edit3 size={14} /></button>
                <button onClick={() => handleDuplicate(doc)} className="p-2 hover:bg-white/10 rounded-sm text-gold transition-colors" title="Duplicate"><Copy size={14} /></button>
                <button onClick={() => handleDelete(doc.id)} className="p-2 hover:bg-white/10 rounded-sm text-red-500 transition-colors" title="Delete"><Trash2 size={14} /></button>
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-hidden">
               {Object.entries(doc).filter(([k]) => k !== 'id').slice(0, 4).map(([key, val]) => (
                 <div key={key} className="flex gap-3 text-[0.65rem] border-b border-white/[0.03] pb-2 last:border-0">
                   <span className="text-muted font-mono font-bold w-20 flex-shrink-0 uppercase">{key}</span>
                   <span className="text-white/60 truncate italic">
                     {typeof val === 'object' ? '{...}' : String(val)}
                   </span>
                 </div>
               ))}
               {Object.keys(doc).length > 5 && <p className="text-[0.6rem] text-muted italic">+{Object.keys(doc).length - 5} more fields...</p>}
            </div>
            
            <Button variant="ghost" size="sm" className="mt-6 w-full border border-white/5 text-[0.65rem]" onClick={() => startEdit(doc)}>VIEW FULL DATA</Button>
          </Card>
        ))}
      </div>

      {/* Editor Modal */}
      {editingDoc && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
          <div className="w-full max-w-4xl h-[85vh] bg-[#0A0A0F] border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Database size={18} />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-white uppercase tracking-wider">Editor: {editingDoc.id}</h2>
                  <p className="text-[0.6rem] text-gold uppercase tracking-[0.2em]">{activeCollection}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex bg-black/40 p-1 rounded-sm border border-white/5">
                  <button 
                    onClick={() => setIsJsonMode(false)}
                    className={cn("px-4 py-1.5 text-[0.65rem] font-bold uppercase transition-all rounded-sm", !isJsonMode ? "bg-white/10 text-white" : "text-muted hover:text-white")}
                  >Standard</button>
                  <button 
                    onClick={() => setIsJsonMode(true)}
                    className={cn("px-4 py-1.5 text-[0.65rem] font-bold uppercase transition-all rounded-sm", isJsonMode ? "bg-white/10 text-white" : "text-muted hover:text-white")}
                  >JSON Source</button>
                </div>
                <button onClick={() => setEditDoc(null)} className="text-muted hover:text-white transition-colors p-2"><X size={24} /></button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {isJsonMode ? (
                <div className="h-full flex flex-col space-y-4">
                  <div className="flex items-center gap-3 text-red-400 mb-2">
                    <AlertTriangle size={14} />
                    <p className="text-[0.65rem] font-bold uppercase tracking-widest leading-none pt-1">WARNING: JSON bypasses UI safety checks. Ensure valid syntax.</p>
                  </div>
                  <textarea 
                    className="flex-1 bg-black border border-white/10 rounded-md p-6 font-mono text-xs text-cyan-400 leading-relaxed outline-none focus:border-cyan-500 transition-all resize-none"
                    value={jsonInput}
                    onChange={e => setJsonInput(e.target.value)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {Object.entries(editingDoc).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <label className="admin-label text-[0.6rem] flex items-center justify-between">
                        {key}
                        <span className="text-[0.5rem] opacity-30">{typeof value}</span>
                      </label>
                      {typeof value === 'boolean' ? (
                        <div className="flex bg-black/40 p-1 rounded-sm border border-white/5 h-11">
                          <button 
                            type="button"
                            onClick={() => setEditDoc({...editingDoc, [key]: true})}
                            className={cn("flex-1 text-[0.6rem] font-bold uppercase rounded-sm transition-all", value ? "bg-green-500 text-white" : "text-muted")}
                          >TRUE</button>
                          <button 
                            type="button"
                            onClick={() => setEditDoc({...editingDoc, [key]: false})}
                            className={cn("flex-1 text-[0.6rem] font-bold uppercase rounded-sm transition-all", !value ? "bg-red-500 text-white" : "text-muted")}
                          >FALSE</button>
                        </div>
                      ) : typeof value === 'object' && value !== null ? (
                        <div className="admin-input h-11 bg-white/5 border-dashed border-white/20 flex items-center justify-between text-muted italic text-xs">
                          Complex Object - Switch to JSON
                          <Code size={14} className="text-cyan-500" />
                        </div>
                      ) : (
                        <input 
                          type="text" 
                          className="admin-input h-11" 
                          value={String(value)}
                          onChange={e => setEditDoc({...editingDoc, [key]: e.target.value})}
                        />
                      )}
                    </div>
                  ))}
                  <div className="col-span-full pt-8">
                     <p className="text-[0.65rem] text-muted italic">Fields like 'id' and 'updatedAt' are managed automatically by the system.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-white/5 bg-black/40 flex justify-end gap-4">
              <Button variant="ghost" onClick={() => setEditDoc(null)} disabled={loading}>CANCEL</Button>
              <Button onClick={() => handleSave(editingDoc.id, editingDoc)} disabled={loading} className="min-w-[160px] h-12">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} className="mr-2" /> COMMIT CHANGES</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
