'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUserStore } from '@/store/user-store';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export function UserNav() {
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await authService.logout();
      queryClient.removeQueries();
      queryClient.clear();
      clearUser();
      router.push('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border shadow-sm">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600 focus:text-red-600 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
