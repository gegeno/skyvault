import './globals.css';
import Providers from '@/components/providers';
import { cn } from '@/lib/utils';

export const metadata = {
  title: {
    default: 'SkyVault - Secure Cloud Storage',
    template: '%s | SkyVault',
  },
  description:
    'Secure, fast, and private cloud storage for your most important files. Encrypted vaults, seamless sharing, and instant access.',
  keywords: [
    'cloud storage',
    'secure vault',
    'file sharing',
    'encrypted storage',
    'SkyVault',
    'Next.js',
  ],
  authors: [{ name: 'Ravindra Yadav' }],
  creator: 'SkyVault',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://skyvault.ravindrayadav.me',
    title: 'SkyVault - Secure Cloud Storage',
    description: 'Your files. Secured in the Sky.',
    siteName: 'SkyVault',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background text-foreground antialiased font-sans selection:bg-primary/30',
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
