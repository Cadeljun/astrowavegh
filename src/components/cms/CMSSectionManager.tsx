
'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Save, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';

interface CMSSectionManagerProps {
  pageId: string;
}

function SortableItem({ section, onToggleVisibility }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <Card className="p-4 flex items-center gap-4 bg-dark border-white/10" glowColor="muted">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted hover:text-white p-2">
          <GripVertical size={18} />
        </button>
        <div className="flex-1">
          <p className="font-bold text-white uppercase text-sm tracking-widest">{section.label}</p>
          <p className="text-[0.6rem] text-muted font-mono">{section.key}</p>
        </div>
        <button 
          onClick={() => onToggleVisibility(section.key)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-[0.6rem] font-bold uppercase tracking-widest transition-all ${section.visible ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-white/5 text-muted border border-white/10'}`}
        >
          {section.visible ? <><Eye size={12} /> Visible</> : <><EyeOff size={12} /> Hidden</>}
        </button>
      </Card>
    </div>
  );
}

export default function CMSSectionManager({ pageId }: CMSSectionManagerProps) {
  const { toast } = useToast();
  const [sections, setSections] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const ref = doc(db, 'cms_sections', pageId);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setSections(snap.data().sections.sort((a: any, b: any) => a.order - b.order));
      }
    });
  }, [pageId]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex(i => i.key === active.id);
        const newIndex = items.findIndex(i => i.key === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((item, index) => ({ ...item, order: index }));
      });
    }
  };

  const toggleVisibility = (key: string) => {
    setSections(prev => prev.map(s => s.key === key ? { ...s, visible: !s.visible } : s));
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'cms_sections', pageId), {
        pageSlug: pageId,
        sections,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast({ title: 'Order Saved', description: 'Page structure updated successfully.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Save Failed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/5 p-6 rounded-md border border-white/5">
        <p className="text-xs text-muted leading-relaxed mb-6">
          Drag to reorder sections on the page. Use the toggle button to hide or show sections immediately.
        </p>

        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={sections.map(s => s.key)}
            strategy={verticalListSortingStrategy}
          >
            {sections.map((section) => (
              <SortableItem key={section.key} section={section} onToggleVisibility={toggleVisibility} />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex justify-end sticky bottom-0 pt-4 bg-black/80 backdrop-blur-md">
        <Button 
          onClick={saveOrder} 
          disabled={saving}
          className="min-w-[200px] h-14"
        >
          {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
          SAVE SECTION ORDER
        </Button>
      </div>
    </div>
  );
}
