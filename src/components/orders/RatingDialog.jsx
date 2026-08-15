import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function RatingDialog({ open, onClose, order, reviewerEmail, reviewerName, revieweeEmail, revieweeName, type, onDone }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setLoading(true);
    await base44.entities.Review.create({
      order_id: order.id,
      reviewer_email: reviewerEmail,
      reviewer_name: reviewerName,
      reviewee_email: revieweeEmail,
      reviewee_name: revieweeName,
      rating,
      comment,
      type,
    });
    const updateData = type === 'creator_to_runner' ? { creator_rated: true } : { runner_rated: true };
    await base44.entities.Order.update(order.id, updateData);
    toast.success('Rating submitted!');
    setLoading(false);
    onDone?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Rate {revieweeName}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center gap-1 py-4">
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(s)}
            >
              <Star
                className={cn('w-8 h-8 transition-colors', (hover || rating) >= s ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')}
              />
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Leave a comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[80px]"
        />
        <Button onClick={submit} disabled={loading} className="w-full mt-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Rating'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
