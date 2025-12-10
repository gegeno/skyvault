'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash, ExternalLink, Copy, Folder, Check, Globe, Share2 } from 'lucide-react';
import { shareService } from '@/services/share.service';
import { Table, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileIcon } from '@/components/drive/file-icon';
import { cn } from '@/lib/utils';

export default function SharedPage() {
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['shared-items'],
    queryFn: shareService.getSharedByMe,
  });

  const { mutate: revokeLink, isPending: isRevoking } = useMutation({
    mutationFn: ({ id, type }) => shareService.deleteShareLink(id, type),
    onSuccess: () => {
      toast.success('Link revoked');
      queryClient.invalidateQueries(['shared-items']);
    },
    onError: () => toast.error('Failed to revoke link'),
  });

  const copyLink = (shareId) => {
    const url = `${window.location.origin}/share/${shareId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(shareId);
    toast.success('Link copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const shares = data?.data || [];
  const isEmpty = shares.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border/50 pb-4">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
          <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Shared Items</h2>
          <p className="text-muted-foreground">
            Manage files and folders you have shared publicly.
          </p>
        </div>
      </div>

      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="bg-muted/50 p-6 rounded-full mb-4 ring-1 ring-border">
            <Share2 className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">No shared items</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Items you share via public link will appear here.
          </p>
        </motion.div>
      ) : (
        <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Shared On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <motion.tbody
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="[&_tr:last-child]:border-0"
            >
              <AnimatePresence mode="popLayout">
                {shares.map((share) => {
                  const item = share.file || share.directory;
                  if (!item) return null;
                  const type = share.file ? 'file' : 'directory';

                  return (
                    <motion.tr
                      key={share._id}
                      variants={rowVariants}
                      layout
                      exit={{ opacity: 0, x: -10 }}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted group"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {type === 'file' ? (
                            <FileIcon mimeType={item.mimeType} className="h-8 w-8" />
                          ) : (
                            <Folder className="h-8 w-8 text-yellow-500 fill-yellow-500/20" />
                          )}
                          <span
                            className="truncate max-w-[150px] sm:max-w-[300px] font-medium text-foreground"
                            title={item.name}
                          >
                            {item.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize text-muted-foreground">{type}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {format(new Date(share.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyLink(share.shareId)}
                            title="Copy Link"
                            className={cn(
                              'h-8 w-8 transition-all duration-300',
                              copiedId === share.shareId
                                ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                                : 'text-muted-foreground hover:text-foreground',
                            )}
                          >
                            {copiedId === share.shareId ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(`/share/${share.shareId}`, '_blank')}
                            title="Open Public Page"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm('Are you sure you want to stop sharing this?')) {
                                revokeLink({ id: item._id, type });
                              }
                            }}
                            title="Revoke Share"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={isRevoking}
                          >
                            {isRevoking ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </motion.tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
