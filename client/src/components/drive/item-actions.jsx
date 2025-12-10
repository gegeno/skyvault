'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  MoreVertical,
  Trash,
  RotateCcw,
  Ban,
  Share2,
  Download,
  Pencil,
  FolderInput,
  Copy,
  Loader2,
} from 'lucide-react';
import { ShareModal } from '@/components/modals/share-modal';
import { RenameModal } from '@/components/modals/rename-modal';
import { MoveCopyModal } from '@/components/modals/move-copy-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/button';
import { fileService } from '@/services/file.service';
import { directoryService } from '@/services/directory.service';
import { trashService } from '@/services/trash.service';
import { useUserStore } from '@/store/user-store';

export function ItemActions({ item, type, isTrashView = false }) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [moveCopyAction, setMoveCopyAction] = useState(null);

  const queryClient = useQueryClient();
  const incrementStorage = useUserStore((state) => state.incrementStorage);

  const refresh = () => queryClient.invalidateQueries(['directory']);

  const { mutate: softDelete, isPending: isDeleting } = useMutation({
    mutationFn: () =>
      type === 'folder'
        ? directoryService.deleteDirectory(item._id)
        : fileService.deleteFile(item._id),
    onSuccess: () => {
      toast.success('Moved to trash');
      refresh();
    },
    onError: () => toast.error('Failed to delete'),
  });

  const { mutate: restore, isPending: isRestoring } = useMutation({
    mutationFn: () =>
      type === 'folder'
        ? directoryService.moveDirectory(item._id, null)
        : fileService.moveFile(item._id, null),
    onSuccess: () => {
      toast.success('Restored to My Drive');
      refresh();
    },
    onError: () => toast.error('Failed to restore'),
  });

  const { mutate: permDelete, isPending: isPermDeleting } = useMutation({
    mutationFn: () =>
      type === 'folder'
        ? trashService.permanentDeleteDirectory(item._id)
        : trashService.permanentDeleteFile(item._id),
    onSuccess: () => {
      toast.success('Permanently deleted');
      if (type !== 'folder') incrementStorage(-item.size);
      refresh();
    },
    onError: () => toast.error('Failed to delete forever'),
  });

  const handleDownload = () => {
    const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/file/${item._id}?download=true`;
    window.open(downloadUrl, '_blank');
  };

  const handleAction = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label="More actions"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52" onClick={(e) => e.stopPropagation()}>
          {!isTrashView ? (
            <>
              {type === 'file' && (
                <DropdownMenuItem
                  onClick={(e) => handleAction(e, handleDownload)}
                  className="cursor-pointer"
                >
                  <Download className="mr-2 h-4 w-4 text-muted-foreground" />
                  Download
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => handleAction(e, () => setIsRenameOpen(true))}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => handleAction(e, () => setMoveCopyAction('move'))}
                className="cursor-pointer"
              >
                <FolderInput className="mr-2 h-4 w-4 text-muted-foreground" />
                Move to
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => handleAction(e, () => setMoveCopyAction('copy'))}
                className="cursor-pointer"
              >
                <Copy className="mr-2 h-4 w-4 text-muted-foreground" />
                Make a Copy
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => handleAction(e, () => setIsShareOpen(true))}
                className="cursor-pointer"
              >
                <Share2 className="mr-2 h-4 w-4 text-blue-500" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer focus:bg-destructive/10"
                onClick={(e) => handleAction(e, softDelete)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash className="mr-2 h-4 w-4" />
                )}
                Delete
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem
                onClick={(e) => handleAction(e, restore)}
                className="cursor-pointer"
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="mr-2 h-4 w-4 text-muted-foreground" />
                )}
                Restore
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer focus:bg-destructive/10"
                onClick={(e) => handleAction(e, permDelete)}
                disabled={isPermDeleting}
              >
                {isPermDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Ban className="mr-2 h-4 w-4" />
                )}
                Delete Forever
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isShareOpen && (
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          item={item}
          type={type}
        />
      )}

      {isRenameOpen && (
        <RenameModal
          isOpen={isRenameOpen}
          onClose={() => setIsRenameOpen(false)}
          item={item}
          type={type}
        />
      )}

      {moveCopyAction && (
        <MoveCopyModal
          isOpen={!!moveCopyAction}
          onClose={() => setMoveCopyAction(null)}
          item={item}
          type={type}
          action={moveCopyAction}
        />
      )}
    </>
  );
}
