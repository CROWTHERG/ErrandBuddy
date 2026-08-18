import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

export default function LoginPrompt({ title, message }) {
  const navigate = useNavigate();
  return (
    <div className="px-4 py-4 flex flex-col items-center justify-center min-h-[60vh]">
      <Card className="p-8 flex flex-col items-center text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <LogIn className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-lg font-bold mb-2">{title || 'Login Required'}</h2>
        <p className="text-sm text-muted-foreground mb-6">{message || 'Please log in to access this page.'}</p>
        <Button onClick={() => navigate('/login')} className="w-full h-11 rounded-xl">
          <LogIn className="w-4 h-4 mr-2" /> Go to Login
        </Button>
      </Card>
    </div>
  );
}
