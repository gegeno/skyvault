'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/store/user-store';
import { directoryService } from '@/services/directory.service';
import { trashService } from '@/services/trash.service';
import { ItemCard } from '@/components/drive/item-card';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function TrashPage() {
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['directory', user?.rootTrashDirectory],
    queryFn: () => directoryService.getDirectory(user?.rootTrashDirectory),
    enabled: !!user?.rootTrashDirectory,
  });

  const { mutate: emptyTrash, isPending: isEmptying } = useMutation({
    mutationFn: trashService.emptyTrash,
    onSuccess: () => {
      toast.success('Trash emptied');
      queryClient.invalidateQueries(['directory']);
    },
    onError: () => toast.error('Failed to empty trash'),
  });

  const content = data?.data;
  const isEmpty = content?.files?.length === 0 && content?.directories?.length === 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Trash</h2>
            <p className="text-muted-foreground text-sm">
              Items are permanently deleted when you empty the trash.
            </p>
          </div>
        </div>

        <Button
          variant="destructive"
          disabled={isEmpty || isEmptying}
          onClick={() => {
            if (confirm('Are you sure? This cannot be undone.')) emptyTrash();
          }}
          className="shadow-sm"
        >
          {isEmptying ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Ban className="mr-2 h-4 w-4" />
          )}
          Empty Trash
        </Button>
      </div>

      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="bg-muted/50 p-6 rounded-full mb-4 ring-1 ring-border shadow-sm">
            <Trash2 className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Trash is empty</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Items you delete will show up here. You can restore them or delete them forever.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
        >
          <AnimatePresence>
            {content?.directories?.map((dir) => (
              <motion.div key={dir._id} variants={itemVariants} layout>
                <ItemCard item={dir} type="folder" isTrashView />
              </motion.div>
            ))}
            {content?.files?.map((file) => (
              <motion.div key={file._id} variants={itemVariants} layout>
                <ItemCard item={file} type="file" isTrashView />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
