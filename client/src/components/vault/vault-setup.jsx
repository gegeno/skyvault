'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2, Info } from 'lucide-react';
import { vaultService } from '@/services/vault.service';
import { Button } from '@/components/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';

export function VaultSetup() {
  const [pin, setPin] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: vaultService.setup,
    onSuccess: () => {
      toast.success('Vault created! Reloading...');
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: (error) => {
      toast.error(error.response?.data?.errors[0].pin || 'Failed to setup vault');
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-emerald-100 dark:border-emerald-900/50 bg-card">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full w-fit ring-1 ring-emerald-200 dark:ring-emerald-800">
              <ShieldCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-2xl text-emerald-950 dark:text-emerald-50">
              Setup Secure Vault
            </CardTitle>
            <CardDescription>
              Create a dedicated encrypted space for your sensitive files.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 rounded-lg flex gap-3 text-sm text-amber-800 dark:text-amber-200">
              <Info className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <p>
                <strong>Important:</strong> This PIN is required to access your vault. It is not
                stored plainly and <u>cannot be recovered</u> if lost.
              </p>
            </div>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={6}
                className="text-center text-3xl tracking-[0.5em] h-14 font-mono"
                autoFocus
                autoComplete="off"
                disabled={isPending}
                aria-label="Create a 4-6 digit PIN"
              />
              <Button
                onClick={() => mutate(pin)}
                disabled={pin.length < 4 || isPending}
                className="w-full text-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                size="lg"
              >
                {isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                Create Vault
              </Button>
            </div>
          </CardContent>
          <CardFooter className="justify-center border-t p-4 bg-muted/20">
            <p className="text-xs text-muted-foreground">Minimum 4 digits required</p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
