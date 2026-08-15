import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h2 className="text-xl font-bold">Terms & Privacy</h2>
      </div>

      <Card className="p-6 space-y-6">
        <section>
          <h3 className="font-bold text-sm mb-2">Terms of Service</h3>
          <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
            <p>By using Errand Buddy, you agree to these terms. The app connects people who need errands done with those willing to do them.</p>
            <p>Users must provide accurate information. You are responsible for all activity under your account. Errand Buddy is not liable for transactions between users.</p>
            <p>Users must treat each other with respect. Harassment, fraud, or misuse of the platform will result in account termination.</p>
            <p>Payments are arranged between users. Errand Buddy does not process payments and is not responsible for payment disputes.</p>
          </div>
        </section>

        <section>
          <h3 className="font-bold text-sm mb-2">Privacy Policy</h3>
          <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
            <p>We collect your email, name, profile picture, and location data to provide our services. Location data is used to match you with nearby errands.</p>
            <p>Your data is not sold to third parties. We may share anonymized data for analytics purposes.</p>
            <p>Uploaded ID cards are used solely for verification purposes and are stored securely.</p>
            <p>You can request deletion of your data by contacting support.</p>
          </div>
        </section>

        <section>
          <h3 className="font-bold text-sm mb-2">Community Guidelines</h3>
          <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
            <p>Be honest in your order descriptions and pricing. Complete accepted orders promptly.</p>
            <p>Verify payments before marking them as complete. Rate other users fairly and honestly.</p>
            <p>Report any suspicious activity through the support system.</p>
          </div>
        </section>
      </Card>
    </div>
  );
}
