import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Loader2, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Support() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: tickets = [] } = useQuery({
    queryKey: ['my-tickets', user?.email],
    queryFn: () => base44.entities.SupportTicket.filter({ user_email: user?.email }, '-created_date', 50),
    enabled: !!user,
  });

  const handleSubmit = async () => {
    if (!subject || !message) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    await base44.entities.SupportTicket.create({
      user_email: user.email,
      user_name: user.full_name || user.email,
      subject,
      message,
    });
    setSubject('');
    setMessage('');
    toast.success('Ticket submitted!');
    queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
    setLoading(false);
  };

  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h2 className="text-xl font-bold">Support</h2>
      </div>

      <Card className="p-4 space-y-3 mb-6">
        <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <Textarea placeholder="Describe your issue..." value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[100px]" />
        <Button onClick={handleSubmit} disabled={loading} className="w-full h-11 rounded-xl">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Submit Ticket</>}
        </Button>
      </Card>

      <h3 className="font-semibold text-sm text-muted-foreground mb-3">Your Tickets</h3>
      <div className="space-y-2">
        {tickets.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground text-sm">No tickets yet.</p>
        ) : tickets.map(t => (
          <Card key={t.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">{t.subject}</h4>
              <Badge variant="outline" className={t.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                {t.status === 'done' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                {t.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{t.message}</p>
            {t.admin_reply && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <p className="text-xs font-medium text-primary">Admin Reply:</p>
                <p className="text-xs mt-1">{t.admin_reply}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
