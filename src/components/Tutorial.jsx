import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Package, MapPin, Star, MessageCircle, Shield, ArrowRight } from 'lucide-react';

const steps = [
  { icon: Package, title: 'Create Errands', description: 'Post errands you need done — set pickup & delivery locations, describe the task, and set your price.', color: 'bg-primary' },
  { icon: MapPin, title: 'Location-Based', description: 'All errands are filtered by your city. Grant location access so we show orders near you.', color: 'bg-emerald-500' },
  { icon: Star, title: 'Pick & Deliver', description: 'Browse available errands, accept them, and complete deliveries. Get rated by creators!', color: 'bg-violet-500' },
  { icon: MessageCircle, title: 'Chat & Coordinate', description: 'Chat directly with the other party once an order is accepted to coordinate smoothly.', color: 'bg-sky-500' },
  { icon: Shield, title: 'Get Verified', description: 'Upload your ID card to get verified. Verified users build more trust in the community.', color: 'bg-amber-500' }
];

export default function Tutorial({ onComplete }) {
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < steps.length - 1) {
      setCurrent(current + 1);
    } else {
      onComplete();
    }
  };

  const step = steps[current];
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[90] bg-background flex flex-col"
    >
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center text-center"
          >
            <div className={`w-24 h-24 rounded-3xl ${step.color} flex items-center justify-center mb-8`}>
              <Icon className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
            <p className="text-muted-foreground max-w-sm leading-relaxed">{step.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-8 pb-12">
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-primary' : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>
        <Button onClick={next} className="w-full h-14 text-base rounded-2xl gap-2" size="lg">
          {current < steps.length - 1 ? 'Next' : 'Get Started'}
          <ArrowRight className="w-5 h-5" />
        </Button>
        {current < steps.length - 1 && (
          <Button variant="ghost" onClick={onComplete} className="w-full mt-2 text-muted-foreground">
            Skip Tutorial
          </Button>
        )}
      </div>
    </motion.div>
  );
}
