'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, KeyRound, ShieldCheck, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (user: any) => void;
}

export function LoginModal({ open, onOpenChange, onSuccess }: LoginModalProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      toast.success('Passcode sent!', {
        description: `Check your inbox or use code below`,
      });

      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }
      setStep('otp');
    } catch (err: any) {
      toast.error(err.message || 'Error sending passcode');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      toast.success(`Welcome back, ${data.user.name}!`);
      onSuccess(data.user);
      onOpenChange(false);
      setStep('email');
      setOtp('');
      setDevOtp(null);
    } catch (err: any) {
      toast.error(err.message || 'Invalid passcode');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-2 border border-primary/20">
            {step === 'email' ? <Mail className="h-6 w-6" /> : <KeyRound className="h-6 w-6 text-primary" />}
          </div>
          <DialogTitle className="text-xl font-bold text-center text-foreground">
            {step === 'email' ? 'Enterprise CRM Sign-In' : 'Enter 4-Digit Passcode'}
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            {step === 'email'
              ? 'Passwordless authentication with secure one-time passcode'
              : `We sent a 4-digit code to ${email}`}
          </DialogDescription>
        </DialogHeader>

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Work Email</label>
              <Input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  Send Login Passcode <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {/* Quick Demo Pre-fills */}
            <div className="pt-2 border-t border-border/60">
              <span className="text-[11px] text-muted-foreground block mb-2 font-medium">
                Demo Accounts (Click to test):
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => fillQuickDemo('admin@enterprise.io')}
                  className="text-[11px] px-2.5 py-1 bg-muted/70 hover:bg-muted text-foreground rounded border border-border/80 transition"
                >
                  Admin (Alexander)
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('agent@enterprise.io')}
                  className="text-[11px] px-2.5 py-1 bg-muted/70 hover:bg-muted text-foreground rounded border border-border/80 transition"
                >
                  Agent (Sarah)
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('support@enterprise.io')}
                  className="text-[11px] px-2.5 py-1 bg-muted/70 hover:bg-muted text-foreground rounded border border-border/80 transition"
                >
                  Support (Elena)
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">4-Digit Code</label>
              <Input
                type="text"
                maxLength={4}
                required
                placeholder="• • • •"
                className="text-center text-2xl tracking-[0.5em] font-mono font-bold h-12"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                autoFocus
              />
            </div>

            {devOtp && (
              <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Dev Passcode:</span>
                <span className="font-mono font-bold text-primary text-sm tracking-wider">{devOtp}</span>
                <button
                  type="button"
                  onClick={() => setOtp(devOtp)}
                  className="text-[11px] underline text-primary font-medium"
                >
                  Auto-fill
                </button>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                </>
              ) : (
                'Verify & Enter CRM'
              )}
            </Button>

            <button
              type="button"
              onClick={() => {
                setStep('email');
                setOtp('');
              }}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition underline pt-1"
            >
              ← Back to change email
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
