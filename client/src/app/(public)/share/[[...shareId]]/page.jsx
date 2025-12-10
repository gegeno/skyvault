'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { shareService } from '@/services/share.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileIcon } from '@/components/drive/file-icon';
import {
  Loader2,
  Download,
  Folder,
  FileQuestion,
  Calendar,
  HardDrive,
  ShieldCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
};

export default function PublicSharePage({ params }) {
  const resolvedParams = use(params);
  const shareId = resolvedParams.shareId?.[0];

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-share', shareId],
    queryFn: () => shareService.getPublicShareDetails(shareId),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Retrieving shared file...</p>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-destructive/5 rounded-full blur-[120px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="mx-auto bg-muted p-6 rounded-full w-fit">
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Link Expired or Invalid</h1>
            <p className="text-muted-foreground">
              The file you are looking for is no longer available. It may have been deleted or the
              link was revoked.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const { type, details, ownerName } = data.data;

  const handleDownload = () => {
    if (type === 'file') {
      window.location.href = shareService.getPublicDownloadUrl(shareId);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl border-border/60 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center border-b pb-8 pt-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="mx-auto mb-6 bg-background p-4 rounded-full w-fit shadow-sm ring-1 ring-border"
            >
              {type === 'file' ? (
                <FileIcon mimeType={details.mimeType} className="h-16 w-16" />
              ) : (
                <Folder className="h-16 w-16 text-yellow-500 fill-yellow-500/20" />
              )}
            </motion.div>
            <CardTitle className="text-2xl sm:text-3xl font-bold wrap-break-words px-4 leading-tight">
              {details.name}
            </CardTitle>
            <CardDescription className="mt-2 text-base flex items-center justify-center gap-2">
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider">
                Shared
              </span>
              <span>
                by <span className="font-semibold text-foreground">{ownerName}</span>
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded-xl flex flex-col items-center text-center gap-1 border border-border/50">
                <HardDrive className="h-5 w-5 text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  Size
                </p>
                <p className="font-medium text-lg">{formatBytes(details.size)}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-xl flex flex-col items-center text-center gap-1 border border-border/50">
                <Calendar className="h-5 w-5 text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  Created
                </p>
                <p className="font-medium text-lg">
                  {format(new Date(details.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            {type === 'directory' && (
              <div className="border rounded-xl overflow-hidden bg-background">
                <div className="bg-muted/30 px-4 py-3 text-xs font-semibold text-muted-foreground border-b flex justify-between items-center">
                  <span>Preview Contents</span>
                  <span>{details.files.length + details.directories.length} items</span>
                </div>
                <div className="max-h-48 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-muted">
                  {details.directories.map((d) => (
                    <div
                      key={d._id}
                      className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg text-sm transition-colors"
                    >
                      <Folder className="h-4 w-4 text-yellow-500 fill-yellow-500/20 shrink-0" />
                      <span className="truncate">{d.name}</span>
                    </div>
                  ))}
                  {details.files.map((f) => (
                    <div
                      key={f._id}
                      className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg text-sm transition-colors"
                    >
                      <FileIcon mimeType={f.mimeType} className="h-4 w-4 shrink-0" />
                      <span className="truncate">{f.name}</span>
                    </div>
                  ))}
                  {details.files.length === 0 && details.directories.length === 0 && (
                    <div className="p-4 text-center text-muted-foreground text-xs italic">
                      Empty folder
                    </div>
                  )}
                </div>
              </div>
            )}
            <Button
              size="lg"
              className="w-full gap-2 text-lg h-14 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              onClick={handleDownload}
            >
              <Download className="h-5 w-5" />
              {type === 'file' ? 'Download File' : 'Download as .zip (comming soon)'}
            </Button>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
              <ShieldCheck className="h-3 w-3" />
              <span>Scanned for viruses • Secured by SkyVault</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
