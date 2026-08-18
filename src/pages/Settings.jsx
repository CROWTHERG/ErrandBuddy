import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import DeleteAccountDialog from '@/components/DeleteAccountDialog';
import LoginPrompt from '@/components/LoginPrompt';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    phone: user?.phone || '',
    bio: user?.bio || '',
    profile_picture: user?.profile_picture || '',
  });

  if (!user) return <LoginPrompt title="Login Required" message="Log in to access your settings." />;

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm({ ...form, profile_picture: file_url });
    setUploading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    const updateData = { phone: form.phone, bio: form.bio, profile_picture: form.profile_picture };
    // If picture changed, remove verification
    if (form.profile_picture !== (user?.profile_picture || '') && user?.verified) {
      updateData.verified = false;
      toast.info('Profile picture changed — verification has been reset.');
    }
    await base44.auth.updateMe(updateData);
    toast.success('Profile updated!');
    setLoading(false);
    navigate('/profile');
  };

  const initials = (user?.full_name || '?').slice(0, 2).toUpperCase();

  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h2 className="text-xl font-bold">Settings</h2>
      </div>

      <Card className="p-6 space-y-5">
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={form.profile_picture} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer">
              {uploading ? <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" /> : <Camera className="w-4 h-4 text-primary-foreground" />}
              <input type="file" accept="image/*" onChange={handlePictureUpload} className="hidden" />
            </label>
          </div>
          <p className="text-sm font-semibold mt-3">{user?.full_name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Phone</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" placeholder="+1234567890" />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Bio</Label>
          <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="mt-1" placeholder="Tell us about yourself..." />
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full h-12 rounded-xl">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
        </Button>
      </Card>

      <div className="mt-6 px-1">
        <p className="text-xs text-muted-foreground mb-3 text-center">Danger Zone</p>
        <DeleteAccountDialog />
      </div>
    </div>
  );
}
