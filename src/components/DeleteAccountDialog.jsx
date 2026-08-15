import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DeleteAccountDialog() {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    setLoading(true);
    try {
      await base44.auth.updateMe({ active: false });
      toast.success('Account deactivated. Logging out...');
      setTimeout(() => {
        base44.auth.logout('/login');
      }, 1000);
    } catch {
      toast.error('Failed to deactivate account. Please contact support.');
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full h-12 rounded-xl">
          <Trash2 className="w-4 h-4" /> Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p className="text-destructive font-medium">
                This action is permanent and cannot be undone.
              </p>
              <p>You will immediately:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-sm">
                <li>Be logged out and lose access to your account</li>
                <li>Lose all your errand history, chats, and reviews</li>
                <li>Be unable to create or accept new errands</li>
              </ul>
              <p className="pt-2">
                To confirm, type <strong>DELETE</strong> below:
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type DELETE"
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          autoComplete="off"
        />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading || confirmText !== 'DELETE'}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Forever'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
