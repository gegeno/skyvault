'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, File, Folder, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { searchService } from '@/services/search.service';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchService.search(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (id, type) => {
    setOpen(false);
    if (type === 'directory') {
      router.push(`/drive/${id}`);
    } else {
      window.open(`http://localhost:4000/api/v1/file/${id}`, '_blank');
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2 text-muted-foreground bg-slate-50"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search files...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a filename..." value={query} onValueChange={setQuery} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {isLoading && (
            <div className="p-4 flex justify-center">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          )}

          {data?.data?.directories?.length > 0 && (
            <CommandGroup heading="Folders">
              {data.data.directories.map((dir) => (
                <CommandItem key={dir._id} onSelect={() => handleSelect(dir._id, 'directory')}>
                  <Folder className="mr-2 h-4 w-4" />
                  <span>{dir.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {data?.data?.files?.length > 0 && (
            <CommandGroup heading="Files">
              {data.data.files.map((file) => (
                <CommandItem key={file._id} onSelect={() => handleSelect(file._id, 'file')}>
                  <File className="mr-2 h-4 w-4" />
                  <span>{file.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
