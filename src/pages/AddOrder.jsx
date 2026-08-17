import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useLocation as useGeoLocation } from '@/lib/LocationContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { MapPin, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PaymentMethodPicker from '@/components/orders/PaymentMethodPicker';

export default function AddOrder() {
  const { user } = useAuth();
  const { locationInfo, currency, granted, requestLocation } = useGeoLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    pickup_address: '',
    delivery_address: '',
    amount: '',
    payment_method: 'cash',
    currency: currency || 'USD',
    valid_days: 7,
  });

  useEffect(() => {
    if (!granted) requestLocation();
  }, [granted, requestLocation]);

  useEffect(() => {
    if (currency) setForm((f) => ({ ...f, currency }));
  }, [currency]);

  const update = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.pickup_address || !form.delivery_address || !form.amount) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    await base44.entities.Order.create({
      ...form,
      amount: parseFloat(form.amount),
      creator_email: user.email,
      creator_name: user.full_name || user.email,
      city: locationInfo.city || '',
      country: locationInfo.country || '',
      status: 'open',
    });
    toast.success('Errand created successfully!');
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="px-4 py-4">
      <h2 className="text-xl font-bold mb-4">Create New Errand</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="p-4 space-y-4">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Errand Title *</Label>
            <Input
              placeholder="e.g. Pick up groceries"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Description *</Label>
            <Textarea
              placeholder="Describe what needs to be done..."
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="mt-1 min-h-[80px]"
            />
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> Locations
          </h3>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Pickup Address *</Label>
            <Input
              placeholder="Where to pick up from"
              value={form.pickup_address}
              onChange={(e) => update('pickup_address', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Delivery Address *</Label>
            <Input
              placeholder="Where to deliver to"
              value={form.delivery_address}
              onChange={(e) => update('delivery_address', e.target.value)}
              className="mt-1"
            />
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" /> Payment
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Amount *</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => update('amount', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Currency (auto)</Label>
              <Input
                value={form.currency}
                readOnly
                className="mt-1 bg-muted/50"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Payment Method</Label>
            <PaymentMethodPicker value={form.payment_method} onChange={(v) => update('payment_method', v)} />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Valid for (days) *</Label>
            <Input
              type="number"
              min="1"
              placeholder="7"
              value={form.valid_days}
              onChange={(e) => update('valid_days', parseInt(e.target.value) || 7)}
              className="mt-1"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Order expires after this many days and moves to history.</p>
          </div>
        </Card>

        <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={loading}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Post Errand'}
        </Button>
      </form>
    </div>
  );
}
