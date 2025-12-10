'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Folder, ChevronRight, CornerDownRight, Copy, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { directoryService } from '@/services/directory.service';
import { fileService } from '@/services/file.service';
import { cn } from '@/lib/utils';

export function MoveCopyModal({ isOpen, onClose, item, type, action }) {
  const [currentFolderId, setCurrentFolderId] = useState(null); // null = root
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'My Drive' }]);
  const queryClient = useQueryClient();

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setCurrentFolderId(null);
      setBreadcrumbs([{ id: null, name: 'My Drive' }]);
    }, 300);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['folder-picker', currentFolderId],
    queryFn: () => directoryService.getDirectory(currentFolderId),
    enabled: isOpen,
    keepPreviousData: true,
  });

  const folders = data?.data?.directories?.filter((d) => d._id !== item?._id) || [];

  const handleNavigate = (folder) => {
    setCurrentFolderId(folder._id);
    setBreadcrumbs([...breadcrumbs, { id: folder._id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index) => {
    const target = breadcrumbs[index];
    setCurrentFolderId(target.id);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const apiCall =
        action === 'move'
          ? type === 'folder'
            ? directoryService.moveDirectory
            : fileService.moveFile
          : type === 'folder'
            ? directoryService.copyDirectory
            : fileService.copyFile;

      return apiCall(item._id, currentFolderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['directory']);
      toast.success(`${action === 'move' ? 'Moved' : 'Copied'} successfully`);
      handleClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Operation failed');
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg h-[600px] flex flex-col bg-card text-card-foreground shadow-2xl p-0 gap-0 overflow-hidden">
        <div className="p-6 pb-4 border-b">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'p-2 rounded-full',
                  action === 'move'
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                )}
              >
                {action === 'move' ? (
                  <CornerDownRight className="h-5 w-5" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </div>
              <div>
                <DialogTitle className="capitalize flex items-center gap-2">
                  {action} <span className="text-muted-foreground font-normal">"{item?.name}"</span>
                </DialogTitle>
                <DialogDescription className="mt-1">Select a destination folder</DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>
        <div className="bg-muted/30 border-b px-4 py-2 flex items-center gap-1 overflow-x-auto no-scrollbar mask-gradient-right">
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <div key={crumb.id || 'root'} className="flex items-center whitespace-nowrap">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 mx-1 text-muted-foreground/50" />}
                <button
                  onClick={() => handleBreadcrumbClick(i)}
                  disabled={isLast}
                  className={cn(
                    'text-sm px-2 py-1 rounded-md transition-colors flex items-center gap-1.5',
                    isLast
                      ? 'bg-background shadow-sm font-medium text-foreground pointer-events-none'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {i === 0 && !isLast && <Folder className="h-3.5 w-3.5" />}
                  {crumb.name}
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex-1 min-h-0 bg-background/50 relative">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {isLoading ? (
                <div className="space-y-2 p-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              ) : folders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground opacity-60">
                  <FolderOpen className="h-12 w-12 mb-3 stroke-1" />
                  <p className="text-sm">No folders here</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {folders.map((folder) => (
                    <motion.div
                      key={folder._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        onClick={() => handleNavigate(folder)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 group transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded-md group-hover:scale-110 transition-transform">
                          <Folder className="h-5 w-5 text-yellow-600 dark:text-yellow-500 fill-yellow-500/20" />
                        </div>
                        <span className="text-sm font-medium text-foreground truncate flex-1">
                          {folder.name}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="p-4 border-t bg-muted/10 flex justify-between items-center">
          <div className="text-xs text-muted-foreground px-2">
            {currentFolderId ? 'Moving to folder...' : 'Moving to My Drive'}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={() => mutate()} disabled={isPending} className="min-w-[100px]">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {action === 'move' ? 'Move Here' : 'Copy Here'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
