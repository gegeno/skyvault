'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { directoryService } from '@/services/directory.service';
import { useFileStore } from '@/store/file-store';
import { ItemCard } from './item-card';
import { AddNewButton } from './add-new-button';
import {
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  FolderOpen,
  Home,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function FileBrowser({ folderId }) {
  const router = useRouter();
  const { viewMode, toggleViewMode, pushFolder, history, navigateTo, resetHistory } =
    useFileStore();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['directory', folderId || 'root'],
    queryFn: () => directoryService.getDirectory(folderId),
    keepPreviousData: true,
  });

  const content = data?.data;

  const handleFolderClick = (folder) => {
    pushFolder(folder._id, folder.name);
    router.push(`/drive/${folder._id}`);
  };

  useEffect(() => {
    if (!folderId) {
      resetHistory();
    } else if (content && history.length === 1 && content._id !== history[0].id) {
      pushFolder(content._id, content.name);
    }
  }, [folderId, content, resetHistory, pushFolder, history.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h3 className="text-lg font-medium text-destructive">Failed to load folder</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
          {error?.message || 'Something went wrong. Please try again.'}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center text-sm text-muted-foreground overflow-x-auto no-scrollbar mask-gradient"
        >
          <div className="flex items-center space-x-1 p-1">
            {history.map((crumb, index) => {
              const isLast = index === history.length - 1;
              return (
                <div key={crumb.id || 'root'} className="flex items-center whitespace-nowrap">
                  {index > 0 && <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />}
                  <button
                    onClick={() => {
                      if (isLast) return;
                      navigateTo(index);
                      const path = crumb.id ? `/drive/${crumb.id}` : '/drive';
                      router.push(path);
                    }}
                    disabled={isLast}
                    className={cn(
                      'flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200',
                      isLast
                        ? 'bg-primary/10 text-primary font-semibold pointer-events-none'
                        : 'hover:bg-muted hover:text-foreground cursor-pointer',
                    )}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {index === 0 && <Home className="h-3.5 w-3.5" />}
                    {crumb.name}
                  </button>
                </div>
              );
            })}
          </div>
        </nav>
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <AddNewButton currentFolderId={folderId} />
          <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
          <div className="flex bg-muted/50 p-1 rounded-lg border">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7 transition-all"
              onClick={toggleViewMode}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7 transition-all"
              onClick={toggleViewMode}
              aria-label="List view"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <BrowserSkeleton viewMode={viewMode} />
      ) : content?.directories?.length === 0 && content?.files?.length === 0 ? (
        <EmptyState />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${folderId || 'root'}-${viewMode}`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className={cn(
              'grid gap-4 pb-20',
              viewMode === 'grid'
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
                : 'grid-cols-1',
            )}
          >
            {content?.directories?.map((dir) => (
              <motion.div key={dir._id} variants={itemVariants} layout="position">
                <ItemCard
                  item={dir}
                  type="folder"
                  viewMode={viewMode}
                  onClick={() => handleFolderClick(dir)}
                />
              </motion.div>
            ))}

            {content?.files?.map((file) => (
              <motion.div key={file._id} variants={itemVariants} layout="position">
                <ItemCard
                  item={file}
                  type="file"
                  viewMode={viewMode}
                  onClick={() =>
                    window.open(`${process.env.NEXT_PUBLIC_API_URL}/file/${file._id}`, '_blank')
                  }
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="bg-muted/50 p-6 rounded-full mb-4 ring-1 ring-border shadow-sm">
        <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
      </div>
      <h3 className="text-xl font-semibold text-foreground">It's empty here</h3>
      <p className="text-muted-foreground mt-2 max-w-sm">
        Drag and drop files here to upload, or use the "New" button to create folders.
      </p>
    </motion.div>
  );
}

function BrowserSkeleton({ viewMode }) {
  return (
    <div
      className={cn(
        'grid gap-4',
        viewMode === 'grid'
          ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
          : 'grid-cols-1',
      )}
    >
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton
            className={cn('rounded-xl', viewMode === 'grid' ? 'h-32 w-full' : 'h-16 w-full')}
          />
          {viewMode === 'grid' && <Skeleton className="h-4 w-2/3" />}
        </div>
      ))}
    </div>
  );
}
