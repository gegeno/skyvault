'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, MailCheck, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { forgotPasswordSchema } from '@/lib/validators';
import { authService } from '@/services/auth.service';

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSent(true);
      toast.success('Reset link sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait">
        {!isSent ? (
          <motion.div
            key="form"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="shadow-xl border-slate-200 dark:border-slate-800 bg-card text-card-foreground">
              <CardHeader className="space-y-1">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <KeyRound className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
                <CardDescription className="text-center">
                  Enter your email address and we&aposll send you a link to reset your password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="name@example.com"
                              type="email"
                              autoComplete="email"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send Reset Link
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center border-t p-6 bg-muted/20">
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Login
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="shadow-xl border-slate-200 dark:border-slate-800 bg-card text-card-foreground">
              <CardHeader className="space-y-1">
                <div className="flex justify-center mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                    className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full"
                  >
                    <MailCheck className="h-8 w-8 text-green-600 dark:text-green-500" />
                  </motion.div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">Check your inbox</CardTitle>
                <CardDescription className="text-center">
                  We have sent a password reset link to <br />
                  <span className="font-medium text-foreground">{form.getValues('email')}</span>.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                Didn&apost receive the email? Check your spam folder or try again.
              </CardContent>
              <CardFooter className="flex justify-center border-t p-6 bg-muted/20">
                <Link href="/login">
                  <Button variant="ghost" className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Login
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
