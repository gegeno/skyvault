'use client';

import { toast } from 'sonner';
import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, FolderPlus, FileUp, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { CreateFolderModal } from '@/components/modals/create-folder-modal';
import { fileService } from '@/services/file.service';
import { useUserStore } from '@/store/user-store';
import axios from 'axios';

export function AddNewButton({ currentFolderId }) {
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const incrementStorage = useUserStore((state) => state.incrementStorage);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (file.size > process.env.NEXT_PUBLIC_MAX_FILE_SIZE) {
        toast.error(`File "${file.name}" is too large. Max size is 100MB.`);
        continue;
      }

      const controller = new AbortController();
      let currentFileId = null;
      let isCancelled = false;

      const toastId = toast.custom(
        (t) => (
          <div className="w-[356px] bg-white dark:bg-slate-950 rounded-lg shadow-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col overflow-hidden mr-2">
                <span className="font-medium text-sm truncate" title={file.name}>
                  Uploading {file.name}
                </span>
                <span className="text-xs text-muted-foreground">Please wait...</span>
              </div>
              <button
                onClick={() => {
                  isCancelled = true;
                  controller.abort();
                  toast.dismiss(t);
                }}
                className="text-slate-400 hover:text-slate-900 transition-colors p-1 rounded-full hover:bg-slate-100"
                title="Cancel Upload"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ),
        { duration: Infinity },
      );
      toast.dismiss(toastId);

      const mainToastId = toast.loading(`Starting upload: ${file.name}`, {
        action: {
          label: 'Cancel',
          onClick: () => {
            isCancelled = true;
            controller.abort();
          },
        },
        duration: Infinity,
      });

      try {
        const { uploadUrl, fileId } = await fileService.initiateUpload(file, currentFolderId);
        currentFileId = fileId;

        await fileService.uploadToS3(
          uploadUrl,
          file,
          (percent) => {
            toast.loading(`Uploading ${file.name}: ${percent}%`, {
              id: mainToastId,
              action: {
                label: 'Cancel',
                onClick: () => {
                  isCancelled = true;
                  controller.abort();
                },
              },
            });
          },
          controller.signal,
        );

        const completedFile = await fileService.completeUpload(fileId);

        toast.success(`Uploaded ${file.name}`, {
          id: mainToastId,
          duration: 2000,
        });
        incrementStorage(completedFile.size);
        queryClient.invalidateQueries(['directory', currentFolderId || 'root']);
      } catch (error) {
        console.error('Upload error:', error);

        if (axios.isCancel(error) || isCancelled) {
          toast.error('Upload cancelled', { id: mainToastId, duration: 2000 });

          if (currentFileId) {
            await fileService
              .deleteFile(currentFileId)
              .catch((err) => console.error('Cleanup failed', err));
          }
          continue;
        }

        if (currentFileId) {
          await fileService
            .deleteFile(currentFileId)
            .catch((err) => console.error('Cleanup failed', err));
        }

        let errorMessage = error.response?.data?.message || error.message || 'Upload failed';
        toast.error(`Failed: ${errorMessage}`, {
          id: mainToastId,
          duration: 5000,
        });
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2 shadow-md">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setIsFolderModalOpen(true)}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <FileUp className="mr-2 h-4 w-4" />
            File Upload
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={handleFileUpload}
      />
      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        parentId={currentFolderId}
      />
    </>
  );
}
