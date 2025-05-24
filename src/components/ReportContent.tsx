import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Flag, Loader2 } from 'lucide-react';

interface ReportContentProps {
  contentId: string;
  contentType: 'note' | 'comment' | 'course' | 'discussion';
  content: string;
}

const ReportContent = ({ contentId, contentType, content }: ReportContentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for reporting this content.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.from('flagged_content').insert({
        content_id: contentId,
        type: contentType,
        content: content,
        reason: reason.trim(),
        reported_by: user?.id,
      });

      if (error) throw error;

      toast({
        title: 'Content Reported',
        description: 'Thank you for reporting this content. Our moderators will review it shortly.',
      });
      setIsOpen(false);
      setReason('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to report content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
          <Flag className="h-4 w-4 mr-1" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
          <DialogDescription>
            Please provide a reason for reporting this content. Our moderators will review your report.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder="Why are you reporting this content?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportContent; 