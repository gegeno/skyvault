'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Folder } from 'lucide-react';
import { FileIcon } from './file-icon';
import { format } from 'date-fns';
import { ItemActions } from './item-actions';

const formatBytes = (bytes) => {
  if (bytes === undefined || bytes === null) return '-';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
};

export function ItemCard({ item, type, onClick, isTrashView, viewMode = 'grid' }) {
  const isFolder = type === 'folder';

  const Actions = (
    <div
      onClick={(e) => e.stopPropagation()}
      className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
    >
      <ItemActions item={item} type={type} isTrashView={isTrashView} />
    </div>
  );

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="group flex items-center gap-3 p-2 rounded-md border border-transparent bg-card hover:bg-accent/50 hover:border-border transition-all cursor-pointer ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
      >
        <div className="shrink-0">
          {isFolder ? (
            <Folder className="h-6 w-6 text-yellow-500 fill-yellow-500/20" />
          ) : (
            <FileIcon mimeType={item.mimeType} className="h-6 w-6" />
          )}
        </div>
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <span className="text-sm font-medium truncate md:col-span-6 text-foreground">
            {item.name}
          </span>
          <span className="text-xs text-muted-foreground hidden md:block md:col-span-3">
            {format(new Date(item.updatedAt), 'MMM d, yyyy')}
          </span>
          <span className="text-xs text-muted-foreground hidden md:block md:col-span-3 text-right pr-4 font-mono">
            {formatBytes(item.size)}
          </span>
        </div>
        <div className="shrink-0">{Actions}</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="h-full"
    >
      <Card
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        className="group relative cursor-pointer h-full flex flex-col overflow-hidden border-border/60 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all bg-card ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="absolute top-1 right-1 z-10 scale-90">{Actions}</div>
        <CardContent className="flex-1 p-4 flex flex-col items-center justify-center min-h-[100px] bg-linear-to-b from-transparent to-muted/20">
          {isFolder ? (
            <Folder className="h-12 w-12 text-yellow-500 fill-yellow-500/20 drop-shadow-sm transition-transform group-hover:scale-110 duration-300" />
          ) : (
            <div className="transition-transform group-hover:scale-110 duration-300">
              <FileIcon mimeType={item.mimeType} className="h-10 w-10 shadow-sm" />
            </div>
          )}
        </CardContent>
        <CardFooter className="p-2 px-3 border-t bg-card/50 backdrop-blur-sm flex flex-col items-start gap-0.5">
          <p
            className="text-xs font-medium truncate w-full text-foreground group-hover:text-primary transition-colors"
            title={item.name}
          >
            {item.name}
          </p>
          <div className="flex justify-between w-full text-[10px] text-muted-foreground font-mono leading-none py-0.5">
            <span>{formatBytes(item.size)}</span>
            <span>{format(new Date(item.updatedAt), 'MMM d')}</span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
