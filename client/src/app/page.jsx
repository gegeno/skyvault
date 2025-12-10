'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Cloud, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
      },
    },
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground overflow-hidden relative selection:bg-primary/20">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container max-w-4xl px-4 flex flex-col items-center text-center space-y-8"
      >
        <motion.div variants={itemVariants} className="p-4 bg-primary/10 rounded-full mb-4">
          <Cloud className="h-12 w-12 text-primary" />
        </motion.div>
        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100"
        >
          Your files. <span className="text-primary">Secured</span> in the Sky.
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl"
        >
          SkyVault offers encrypted, lightning-fast cloud storage for your most important documents.
          Access them anywhere, anytime, with peace of mind.
        </motion.p>
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 mt-8 w-full justify-center"
        >
          <Button size="lg" className="h-12 px-8 text-lg" asChild>
            <Link href="/login">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-lg" asChild>
            <Link href="/register">Create Account</Link>
          </Button>
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left w-full"
        >
          <FeatureCard
            icon={<ShieldCheck className="h-6 w-6 text-emerald-500" />}
            title="Secure Vault"
            description="Bank-grade encryption for your private vault folder."
          />
          <FeatureCard
            icon={<Zap className="h-6 w-6 text-yellow-500" />}
            title="Lightning Fast"
            description="Optimized uploads and downloads powered by S3."
          />
          <FeatureCard
            icon={<Cloud className="h-6 w-6 text-blue-500" />}
            title="Anywhere Access"
            description="Your files follow you across all your devices."
          />
        </motion.div>
      </motion.div>
      <footer className="absolute bottom-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()} SkyVault. All rights reserved.
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-2 bg-muted/50 w-fit p-2 rounded-lg">{icon}</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
