'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, FolderPlus } from 'lucide-react';
import { directoryService } from '@/services/directory.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

export function CreateFolderModal({ isOpen, onClose, parentId }) {
  const [name, setName] = useState('');
  const queryClient = useQueryClient();

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setName('');
    }, 300);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () => directoryService.createDirectory(name, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['directory', parentId || 'root']);
      toast.success('Folder created successfully');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create folder');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground border-border shadow-xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <FolderPlus className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Create New Folder</DialogTitle>
          </div>
          <DialogDescription>
            Enter a name for your new folder to organize your files.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label
              htmlFor="folder-name"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Name
            </label>
            <Input
              id="folder-name"
              placeholder="e.g., Projects"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              disabled={isPending}
              autoComplete="off"
              className="col-span-3 focus-visible:ring-primary"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Folder'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
