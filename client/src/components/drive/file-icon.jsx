import { FileText, Image, Music, Video, File, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

export const FileIcon = ({ mimeType, className }) => {
  const props = { className: cn('h-10 w-10', className) };

  if (mimeType.startsWith('image/'))
    return <Image {...props} className={cn(props.className, 'text-blue-500')} alt="" />;
  if (mimeType.startsWith('video/'))
    return <Video {...props} className={cn(props.className, 'text-rose-500')} />;
  if (mimeType.startsWith('audio/'))
    return <Music {...props} className={cn(props.className, 'text-purple-500')} />;
  if (mimeType === 'application/pdf')
    return <FileText {...props} className={cn(props.className, 'text-red-500')} />;
  if (mimeType.includes('zip') || mimeType.includes('compressed'))
    return <Archive {...props} className={cn(props.className, 'text-orange-500')} />;

  return <File {...props} className={cn(props.className, 'text-slate-400')} />;
};
