import AuthGuard from '@/components/auth/auth-guard';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { UserNav } from '@/components/layout/user-nav';
import { SearchBar } from '@/components/layout/search-bar';
import ThemeToggle from '@/components/theme-toggle';

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background font-sans antialiased flex flex-col md:flex-row">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out md:pl-64">
          <header className="sticky top-0 z-40 w-full h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2 md:hidden ml-10">
              <span className="font-semibold tracking-tight text-foreground">SkyVault</span>
            </div>
            <div className="hidden md:block" />
            <div className="flex items-center gap-3 sm:gap-4 ml-auto">
              <div className="w-full max-w-sm">
                <SearchBar />
              </div>
              <UserNav />
            </div>
          </header>
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
            <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </div>
        </main>
        <ThemeToggle />
      </div>
    </AuthGuard>
  );
}
