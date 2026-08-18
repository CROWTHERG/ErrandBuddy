import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, Shield, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import LoginPrompt from '@/components/LoginPrompt';

export default function Verification() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [idUrl, setIdUrl] = useState('');

  const { data: verifications = [], refetch } = useQuery({
    queryKey: ['my-verification', user?.email],
    queryFn: () => base44.entities.Verification.filter({ user_email: user?.email }, '-created_date', 5),
    enabled: !!user,
  });

  const latest = verifications[0];

  if (!user) return <LoginPrompt title="Login Required" message="Log in to verify your identity." />;

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setIdUrl(file_url);
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!idUrl) { toast.error('Please upload your ID card'); return; }
    setSubmitting(true);
    await base44.entities.Verification.create({
      user_email: user.email,
      user_name: user.full_name || user.email,
      id_card_url: idUrl,
      profile_picture_url: user.profile_picture || '',
      status: 'awaiting',
    });
    toast.success('Verification submitted! We will review shortly.');
    setSubmitting(false);
    refetch();
  };

  const statusIcon = {
    awaiting: <Clock className="w-5 h-5 text-amber-500" />,
    approved: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    rejected: <XCircle className="w-5 h-5 text-destructive" />,
  };

  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h2 className="text-xl font-bold">Verification</h2>
      </div>

      {latest && (
        <Card className="p-4 mb-4 flex items-center gap-3">
          {statusIcon[latest.status]}
          <div>
            <p className="font-semibold text-sm capitalize">{latest.status === 'awaiting' ? 'Awaiting Approval' : latest.status}</p>
            {latest.admin_note && <p className="text-xs text-muted-foreground mt-1">{latest.admin_note}</p>}
          </div>
        </Card>
      )}

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-semibold">ID Verification</h3>
            <p className="text-xs text-muted-foreground">Upload an ID card with your name and photo</p>
          </div>
        </div>

        {idUrl && (
          <img src={idUrl} alt="ID Card" className="w-full h-40 object-cover rounded-lg border" />
        )}

        <label className="flex items-center justify-center gap-2 h-12 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
          <span className="text-sm text-muted-foreground">{uploading ? 'Uploading...' : 'Upload ID Card'}</span>
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>

        <Button onClick={handleSubmit} disabled={submitting || !idUrl} className="w-full h-12 rounded-xl">
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit for Verification'}
        </Button>
      </Card>
    </div>
  );
}
