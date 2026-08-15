import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

function VerificationCard({ v, onAction }) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (status) => {
    setLoading(true);
    await base44.entities.Verification.update(v.id, { status, admin_note: note });
    if (status === 'approved') {
      const users = await base44.entities.User.filter({ email: v.user_email });
      if (users[0]) {
        await base44.entities.User.update(users[0].id, { verified: true });
      }
    }
    toast.success(`Verification ${status}`);
    setLoading(false);
    onAction();
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">{v.user_name}</p>
          <p className="text-xs text-muted-foreground">{v.user_email}</p>
        </div>
      </div>
      {v.id_card_url && (
        <img src={v.id_card_url} alt="ID Card" className="w-full h-40 object-cover rounded-lg border" />
      )}
      {v.profile_picture_url && (
        <img src={v.profile_picture_url} alt="Profile" className="w-16 h-16 rounded-full object-cover border" />
      )}
      {v.status === 'awaiting' && (
        <>
          <Input placeholder="Admin note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="flex gap-2">
            <Button onClick={() => handle('approved')} disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-1" /> Approve</>}
            </Button>
            <Button onClick={() => handle('rejected')} disabled={loading} variant="destructive" className="flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4 mr-1" /> Reject</>}
            </Button>
          </div>
        </>
      )}
      {v.admin_note && <p className="text-xs text-muted-foreground">Note: {v.admin_note}</p>}
    </Card>
  );
}

export default function AdminVerifications() {
  const queryClient = useQueryClient();
  const { data: verifications = [], isLoading } = useQuery({
    queryKey: ['admin-verifications'],
    queryFn: () => base44.entities.Verification.list('-created_date', 200),
  });

  const awaiting = verifications.filter(v => v.status === 'awaiting');
  const approved = verifications.filter(v => v.status === 'approved');
  const rejected = verifications.filter(v => v.status === 'rejected');

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="px-4 py-4">
      <h2 className="text-xl font-bold mb-4">Verifications</h2>
      <Tabs defaultValue="awaiting">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="awaiting">Awaiting ({awaiting.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
        </TabsList>
        {['awaiting', 'approved', 'rejected'].map(tab => (
          <TabsContent key={tab} value={tab}>
            <div className="space-y-3">
              {(tab === 'awaiting' ? awaiting : tab === 'approved' ? approved : rejected).map(v => (
                <VerificationCard key={v.id} v={v} onAction={refresh} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
