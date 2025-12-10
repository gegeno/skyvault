'use client';

import { use } from 'react';
import { motion } from 'framer-motion';
import { HardDrive } from 'lucide-react';
import FileBrowser from '@/components/drive/file-browser';

export default function DrivePage({ params }) {
  const resolvedParams = use(params);
  const folderId = resolvedParams.folderId?.[0] || null;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 border-b border-border/50 pb-4"
      >
        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
          <HardDrive className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">My Drive</h2>
          <p className="text-muted-foreground text-sm">Manage your files and folders</p>
        </div>
      </motion.div>
      <FileBrowser folderId={folderId} />
    </div>
  );
}
