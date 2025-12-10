'use client';

import { use } from 'react';
import { useUserStore } from '@/store/user-store';
import { VaultSetup } from '@/components/vault/vault-setup';
import { VaultLock } from '@/components/vault/vault-lock';
import FileBrowser from '@/components/drive/file-browser';
import { Button } from '@/components/ui/button';
import { Lock, ShieldCheck } from 'lucide-react';
import { vaultService } from '@/services/vault.service';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function VaultPage({ params }) {
  const resolvedParams = use(params);
  const folderId = resolvedParams.folderId?.[0] || null;

  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  if (!user) return null;

  const handleLock = async () => {
    try {
      await vaultService.lock();
      setUser({ ...user, isVaultUnlocked: false });
      toast.success('Vault Locked');
    } catch (err) {
      toast.error('Failed to lock');
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  };

  return (
    <AnimatePresence mode="wait">
      {!user.hasVault ? (
        <motion.div key="setup" {...pageVariants}>
          <VaultSetup />
        </motion.div>
      ) : !user.isVaultUnlocked ? (
        <motion.div key="locked" {...pageVariants}>
          <VaultLock />
        </motion.div>
      ) : (
        <motion.div key="unlocked" {...pageVariants} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-emerald-50 dark:bg-emerald-950/30 p-6 rounded-xl border border-emerald-100 dark:border-emerald-900/50 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-full ring-1 ring-emerald-200 dark:ring-emerald-800">
                <ShieldCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-50">
                  Secure Vault
                </h2>
                <p className="text-sm text-emerald-700 dark:text-emerald-400/80 mt-1">
                  Your files here are encrypted with bank-grade security.
                </p>
              </div>
            </div>
            <Button
              onClick={handleLock}
              variant="outline"
              className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-900 dark:hover:text-emerald-100 transition-colors shadow-sm"
            >
              <Lock className="mr-2 h-4 w-4" />
              Lock Vault
            </Button>
          </div>
          <div className="min-h-[500px]">
            <FileBrowser folderId={folderId || user.rootVaultDirectory} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
