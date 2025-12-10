'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { Copy, Globe, Loader2, Trash, Check, Link as LinkIcon, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { shareService } from '@/services/share.service';
import { cn } from '@/lib/utils';

export function ShareModal({ isOpen, onClose, item, type }) {
  const [link, setLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setLink('');
      setIsCopied(false);
    }, 300);
  };

  const { mutate: createLink, isPending } = useMutation({
    mutationFn: () => shareService.createShareLink(item._id, type),
    onSuccess: (data) => {
      const fullUrl = `${window.location.origin}/share/${data.data.shareId}`;
      setLink(fullUrl);
      toast.success('Public link created');
    },
    onError: () => toast.error('Failed to generate link'),
  });

  const { mutate: revokeLink, isPending: isRevoking } = useMutation({
    mutationFn: () => shareService.deleteShareLink(item._id, type),
    onSuccess: () => {
      setLink('');
      toast.success('Link revoked. Item is private again.');
    },
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground shadow-xl overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle>Share "{item?.name}"</DialogTitle>
          </div>
          <DialogDescription>Manage public access to this {type}.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <AnimatePresence mode="wait">
            {!link ? (
              <motion.div
                key="private-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl bg-muted/30 text-center gap-3"
              >
                <div className="p-3 bg-muted rounded-full">
                  <Globe className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium text-foreground">No active link</h4>
                  <p className="text-sm text-muted-foreground max-w-60 mx-auto">
                    This item is currently private. Generate a link to share it with anyone.
                  </p>
                </div>
                <Button onClick={() => createLink()} disabled={isPending} className="mt-2">
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LinkIcon className="mr-2 h-4 w-4" />
                  )}
                  Create Public Link
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="public-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-lg text-sm text-green-700 dark:text-green-400">
                  <Globe className="h-4 w-4 shrink-0" />
                  <span>This item is now viewable by anyone with the link.</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="share-link" className="text-sm font-medium">
                    Public Link
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="share-link"
                        value={link}
                        readOnly
                        className="pr-10 font-mono text-sm bg-muted/50 text-muted-foreground focus-visible:ring-0 focus-visible:border-primary"
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={copyToClipboard}
                      className={cn(
                        'shrink-0 transition-colors',
                        isCopied && 'text-green-600 border-green-200 bg-green-50',
                      )}
                    >
                      <span className="sr-only">Copy link</span>
                      {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => revokeLink()}
                    disabled={isRevoking}
                    className="opacity-90 hover:opacity-100"
                  >
                    {isRevoking ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="mr-2 h-4 w-4" />
                    )}
                    Revoke Access
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="ghost" onClick={handleClose} className="mr-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
