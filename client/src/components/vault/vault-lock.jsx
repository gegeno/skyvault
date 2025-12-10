'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Lock, Loader2, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/store/user-store';
import { vaultService } from '@/services/vault.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function VaultLock() {
  const [pin, setPin] = useState('');
  const [isShake, setIsShake] = useState(false);

  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);

  const { mutate, isPending } = useMutation({
    mutationFn: vaultService.unlock,
    onSuccess: () => {
      toast.success('Vault Unlocked');
      setUser({ ...user, isVaultUnlocked: true });
    },
    onError: () => {
      toast.error('Invalid PIN');
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
      setPin('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin.length < 4) return;
    mutate(pin);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <motion.div
        animate={isShake ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border-border bg-card">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 bg-primary/10 p-4 rounded-full w-fit ring-1 ring-primary/20">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Vault Locked</CardTitle>
            <CardDescription>Enter your secure PIN to access encrypted files.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="text-center text-xl md:text-3xl tracking-[0.5em] h-8 md:h-14 font-mono"
                  autoFocus
                  maxLength={6}
                  autoComplete="off" // Security: prevent browser saving
                  disabled={isPending}
                  aria-label="Enter your Vault PIN"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full h-8 md:h-10 text-sm md:text-lg gap-2"
                disabled={isPending || pin.length < 4}
              >
                {isPending ? <Loader2 className="animate-spin" /> : <Unlock className="h-5 w-5" />}
                Unlock Vault
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
