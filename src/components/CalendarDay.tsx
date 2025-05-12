import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns-jalali';
import { DayNote } from '@/types';
import { queryCustomTable } from '@/utils/supabaseUtils';

interface CalendarDayProps {
  date: Date;
  isToday?: boolean;
  isSelected?: boolean;
  hasDebts?: boolean;
  onClick?: () => void;
  debtsCount?: number;
}

interface DayNoteData {
  id: string;
  note: string;
  date: string; // Add date property to match the expected shape
  user_id?: string;
  created_at?: string;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  isToday,
  isSelected,
  hasDebts,
  onClick,
  debtsCount = 0,
}) => {
  const [note, setNote] = useState('');
  const [noteId, setNoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const formattedDate = format(date, 'yyyy-MM-dd');
  
  // Fetch notes when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      const fetchNote = async () => {
        setIsLoading(true);
        try {
          // Use our custom query utility for the day_notes table
          const { data, error } = await queryCustomTable<DayNoteData>('day_notes')
            .select('*')
            .eq('date', formattedDate)
            .maybeSingle();
          
          if (error) throw error;
          
          if (data) {
            setNote((data as DayNoteData).note || '');
            setNoteId((data as DayNoteData).id);
          } else {
            setNote('');
            setNoteId(null);
          }
        } catch (error) {
          console.error('Error fetching note:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchNote();
    }
  }, [isDialogOpen, formattedDate]);
  
  // Save note
  const saveNote = async () => {
    try {
      if (noteId) {
        // Update existing note
        const { error } = await queryCustomTable<DayNoteData>('day_notes')
          .update({ note })
          .eq('id', noteId);
          
        if (error) throw error;
      } else {
        // Insert new note with proper date property
        const { error } = await queryCustomTable<DayNoteData>('day_notes')
          .insert({ date: formattedDate, note });
          
        if (error) throw error;
      }
      
      toast({
        title: 'یادداشت ذخیره شد',
        description: 'یادداشت با موفقیت ذخیره شد.',
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        variant: 'destructive',
        title: 'خطا در ذخیره یادداشت',
        description: 'مشکلی در ذخیره یادداشت رخ داده است.',
      });
    }
  };
  
  // Delete note
  const deleteNote = async () => {
    if (!noteId) return;
    
    try {
      const { error } = await queryCustomTable<DayNoteData>('day_notes')
        .delete()
        .eq('id', noteId);
        
      if (error) throw error;
      
      setNote('');
      setNoteId(null);
      
      toast({
        title: 'یادداشت حذف شد',
        description: 'یادداشت با موفقیت حذف شد.',
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        variant: 'destructive',
        title: 'خطا در حذف یادداشت',
        description: 'مشکلی در حذف یادداشت رخ داده است.',
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <button
          className={`h-full w-full flex flex-col items-center justify-start p-2 rounded-md transition-colors ${
            isToday
              ? 'bg-primary/10 text-primary font-bold border border-primary/20'
              : isSelected
              ? 'bg-gray-100'
              : 'hover:bg-gray-50'
          }`}
          onClick={onClick}
        >
          <div className="text-sm font-medium">{format(date, 'd')}</div>
          {hasDebts && (
            <div className="mt-1 text-xs bg-primary/20 text-primary px-1 rounded-full">
              {debtsCount} بدهی
            </div>
          )}
          {noteId && (
            <div className="mt-1 text-xs bg-amber-100 text-amber-800 px-1 rounded-full">
              یادداشت
            </div>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{format(date, 'PPP')}</DialogTitle>
          <DialogDescription>
            یادداشت خود را برای این روز وارد کنید
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="text-center py-4">در حال بارگذاری...</div>
        ) : (
          <>
            <div className="my-4">
              <Textarea
                placeholder="یادداشت خود را اینجا بنویسید..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={6}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              {noteId && (
                <Button variant="destructive" onClick={deleteNote}>
                  حذف یادداشت
                </Button>
              )}
              <Button onClick={saveNote}>ذخیره</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CalendarDay;
