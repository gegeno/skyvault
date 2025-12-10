'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserStore } from '@/store/user-store';
import { HardDrive, Lock, Trash2, Cloud, Menu, Globe, PieChart } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const navItems = [
  {
    title: 'My Drive',
    href: '/drive',
    icon: HardDrive,
    color: 'text-blue-500 dark:text-blue-400',
  },
  {
    title: 'Secure Vault',
    href: '/vault',
    icon: Lock,
    color: 'text-emerald-500 dark:text-emerald-400',
  },
  {
    title: 'Shared',
    href: '/shared',
    icon: Globe,
    color: 'text-purple-500 dark:text-purple-400',
  },
  {
    title: 'Trash',
    href: '/trash',
    icon: Trash2,
    color: 'text-red-500 dark:text-red-400',
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);

  const used = user?.storageUsed || 0;
  const quota = user?.storageQuota || process.env.NEXT_PUBLIC_MAX_STORAGE_SIZE;
  const percent = Math.min((used / quota) * 100, 100);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const SidebarContent = (
    <div className="flex flex-col h-full py-4 bg-sidebar text-sidebar-foreground border-r border-sidebar-border w-full">
      <div className="px-6 py-4 mb-2">
        <Link href="/drive" className="flex items-center gap-3 group focus-visible:outline-none">
          <div className="bg-sidebar-primary p-2 rounded-lg text-sidebar-primary-foreground group-hover:bg-sidebar-primary/90 transition-colors">
            <Cloud className="h-6 w-6" />
          </div>
          <span className="font-bold text-xl tracking-tight">SkyVault</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Button
              key={item.href}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3 mb-1 font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
              )}
              asChild
            >
              <Link href={item.href} aria-current={isActive ? 'page' : undefined}>
                <item.icon className={cn('h-5 w-5 transition-colors', item.color)} />
                {item.title}
              </Link>
            </Button>
          );
        })}
      </nav>
      <div className="px-6 py-6 mt-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/50 p-4 rounded-xl border border-border/50 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium flex items-center gap-2">
              <PieChart className="h-4 w-4 text-muted-foreground" />
              Storage
            </span>
            <span className="text-muted-foreground text-xs font-mono">{Math.round(percent)}%</span>
          </div>
          <Progress value={percent} className="h-2 bg-sidebar-border" />
          <div className="text-xs text-muted-foreground flex justify-between">
            <span>
              <span className="font-medium text-foreground">{formatBytes(used)}</span> used
            </span>
            <span>
              of <span className="font-medium text-foreground">{formatBytes(quota)}</span>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex w-64 h-screen fixed left-0 top-0 z-30 flex-col bg-sidebar border-r border-sidebar-border">
        {SidebarContent}
      </aside>
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden shrink-0">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-72 border-r-sidebar-border bg-sidebar text-sidebar-foreground"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            {SidebarContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
