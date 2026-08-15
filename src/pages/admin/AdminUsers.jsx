import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, CheckCircle } from 'lucide-react';

export default function AdminUsers() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list('-created_date', 200),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="px-4 py-4">
      <h2 className="text-xl font-bold mb-4">Users ({users.length})</h2>
      <div className="space-y-2">
        {users.map(u => (
          <Card key={u.id} className="p-4 flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={u.profile_picture} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">{(u.full_name || u.email || '?').slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{u.full_name || 'No name'}</p>
              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
            </div>
            {u.verified && <Badge className="bg-green-100 text-green-700 text-[10px]"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>}
          </Card>
        ))}
      </div>
    </div>
  );
}