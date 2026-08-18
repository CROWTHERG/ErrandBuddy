import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, CheckCircle, Ban, Pause, Play, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsers() {
  const { user: adminUser } = useAuth();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list('-created_date', 200),
  });

  const handleBan = async (u) => {
    setActionLoading(u.id);
    try {
      await base44.entities.User.update(u.id, { banned: true, suspended: false });
      if (u.phone) {
        await base44.entities.BannedPhone.create({ phone: u.phone, user_email: u.email });
      }
      toast.success('User banned');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (e) {
      toast.error('Failed to ban user');
    }
    setActionLoading(null);
  };

  const handleUnban = async (u) => {
    setActionLoading(u.id);
    try {
      await base44.entities.User.update(u.id, { banned: false });
      if (u.phone) {
        await base44.entities.BannedPhone.deleteMany({ phone: u.phone });
      }
      toast.success('User unbanned');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (e) {
      toast.error('Failed to unban user');
    }
    setActionLoading(null);
  };

  const handleSuspend = async (userId) => {
    setActionLoading(userId);
    try {
      await base44.entities.User.update(userId, { suspended: true });
      toast.success('User suspended');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (e) {
      toast.error('Failed to suspend user');
    }
    setActionLoading(null);
  };

  const handleUnsuspend = async (userId) => {
    setActionLoading(userId);
    try {
      await base44.entities.User.update(userId, { suspended: false });
      toast.success('User unsuspended');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (e) {
      toast.error('Failed to unsuspend user');
    }
    setActionLoading(null);
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="px-4 py-4">
      <h2 className="text-xl font-bold mb-4">Users ({users.length})</h2>
      <div className="space-y-2">
        {users.map(u => {
          const isSelf = u.id === adminUser?.id;
          const isAdmin = u.role === 'admin';
          const isDisabled = isSelf || isAdmin;
          return (
            <Card key={u.id} className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarImage src={u.profile_picture} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">{(u.full_name || u.email || '?').slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{u.full_name || 'No name'}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  {u.phone && <p className="text-xs text-muted-foreground truncate">{u.phone}</p>}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex flex-wrap gap-1 justify-end">
                    {u.verified && <Badge className="bg-green-100 text-green-700 text-[10px]"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>}
                    {u.banned && <Badge className="bg-red-100 text-red-700 text-[10px]"><Ban className="w-3 h-3 mr-1" />Banned</Badge>}
                    {u.suspended && <Badge className="bg-amber-100 text-amber-700 text-[10px]"><Pause className="w-3 h-3 mr-1" />Suspended</Badge>}
                    {isAdmin && <Badge className="bg-primary/10 text-primary text-[10px]"><ShieldCheck className="w-3 h-3 mr-1" />Admin</Badge>}
                  </div>
                  {!isDisabled && (
                    <div className="flex gap-1">
                      {u.banned ? (
                        <Button size="sm" variant="outline" className="h-7 text-xs" disabled={actionLoading === u.id} onClick={() => handleUnban(u)}>
                          {actionLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Unban'}
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50" disabled={actionLoading === u.id} onClick={() => handleBan(u)}>
                          {actionLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Ban className="w-3 h-3 mr-1" />Ban</>}
                        </Button>
                      )}
                      {u.suspended ? (
                        <Button size="sm" variant="outline" className="h-7 text-xs" disabled={actionLoading === u.id} onClick={() => handleUnsuspend(u.id)}>
                          {actionLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Play className="w-3 h-3 mr-1" />Unsuspend</>}
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="h-7 text-xs text-amber-600 border-amber-200 hover:bg-amber-50" disabled={actionLoading === u.id} onClick={() => handleSuspend(u.id)}>
                          {actionLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Pause className="w-3 h-3 mr-1" />Suspend</>}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
