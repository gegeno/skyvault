'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fileService } from '@/services/file.service';
import { directoryService } from '@/services/directory.service';

export function RenameModal({ isOpen, onClose, item, type }) {
  const [baseName, setBaseName] = useState('');
  const [extension, setExtension] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen && item) {
      const timer = setTimeout(() => {
        if (type === 'file') {
          const lastDotIndex = item.name.lastIndexOf('.');
          if (lastDotIndex > 0) {
            setBaseName(item.name.substring(0, lastDotIndex));
            setExtension(item.name.substring(lastDotIndex));
          } else {
            setBaseName(item.name);
            setExtension('');
          }
        } else {
          setBaseName(item.name);
          setExtension('');
        }
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [isOpen, item?._id, item?.name, type]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setBaseName('');
      setExtension('');
    }, 300);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const finalName = `${baseName}${extension}`;
      return type === 'folder'
        ? directoryService.renameDirectory(item._id, finalName)
        : fileService.renameFile(item._id, finalName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['directory']);
      toast.success('Renamed successfully');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Rename failed');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalName = `${baseName}${extension}`;
    if (!baseName.trim() || finalName === item?.name) return;
    mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground shadow-xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Pencil className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Rename {type === 'folder' ? 'Folder' : 'File'}</DialogTitle>
          </div>
          <DialogDescription>Enter a new name for this item.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="rename-input" className="text-sm font-medium">
              Name
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="rename-input"
                value={baseName}
                onChange={(e) => setBaseName(e.target.value)}
                placeholder="Enter new name"
                autoFocus
                autoComplete="off"
                disabled={isPending}
                className="flex-1"
              />
              {extension && (
                <div
                  className="shrink-0 px-3 py-2 bg-muted text-muted-foreground text-sm font-mono border rounded-md select-none"
                  title="File extension cannot be changed"
                  aria-label={`File extension: ${extension}`}
                >
                  {extension}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !baseName.trim() || `${baseName}${extension}` === item?.name}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
