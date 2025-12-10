'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff, ArrowRight, Check, ArrowLeft, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { registerStep1Schema, registerStep2Schema, TRUSTED_DOMAINS } from '@/lib/validators';
import { authService } from '@/services/auth.service';
import GoogleLoginBtn from './google-login-btn';

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const form1 = useForm({
    resolver: zodResolver(registerStep1Schema),
    defaultValues: {
      name: '',
      emailLocal: '',
      emailDomain: '@gmail.com',
      password: '',
    },
  });

  const form2 = useForm({
    resolver: zodResolver(registerStep2Schema),
    defaultValues: {
      otp: '',
    },
  });

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  const onStep1Submit = async (data) => {
    setLoading(true);
    try {
      const fullEmail = `${data.emailLocal}${data.emailDomain}`;
      setFormData({
        name: data.name,
        email: fullEmail,
        password: data.password,
      });

      await authService.sendOtp(fullEmail);
      toast.success(`OTP sent to ${fullEmail}`);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const onStep2Submit = async (data) => {
    setLoading(true);
    try {
      const payload = { ...formData, otp: data.otp };
      await authService.register(payload);
      toast.success('Registration successful! Please log in.');
      router.push('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <Card className="shadow-xl border-slate-200 dark:border-slate-800 bg-card text-card-foreground overflow-hidden">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
          <CardDescription>
            {step === 1 ? 'Join SkyVault to secure your files' : `Verify your email address`}
          </CardDescription>
          <div className="flex justify-center gap-2 mt-4">
            <div
              className={`h-1 w-12 rounded-full transition-colors ${step === 1 ? 'bg-primary' : 'bg-primary/30'}`}
            />
            <div
              className={`h-1 w-12 rounded-full transition-colors ${step === 2 ? 'bg-primary' : 'bg-primary/30'}`}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <AnimatePresence mode="wait" custom={step}>
            {step === 1 ? (
              <motion.div
                key="step1"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <Form {...form1}>
                  <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-4">
                    <FormField
                      control={form1.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" autoComplete="name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-2">
                      <FormLabel>Email Address</FormLabel>
                      <div className="flex gap-2 items-start">
                        <FormField
                          control={form1.control}
                          name="emailLocal"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="username"
                                    className="pl-9"
                                    autoComplete="username"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form1.control}
                          name="emailDomain"
                          render={({ field }) => (
                            <FormItem className="w-[140px]">
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Domain" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {TRUSTED_DOMAINS.map((domain) => (
                                    <SelectItem key={domain} value={domain}>
                                      {domain}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <FormField
                      control={form1.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                {...field}
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full mt-2" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </Form>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
                  </div>
                </div>
                <GoogleLoginBtn />
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                custom={-1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground">
                    We&aposve sent a 4-digit code to{' '}
                    <span className="font-medium text-foreground">{formData.email}</span>
                  </p>
                </div>
                <Form {...form2}>
                  <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-6">
                    <FormField
                      control={form2.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="sr-only">OTP Code</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="0000"
                              maxLength={4}
                              className="text-center text-3xl tracking-[1em] font-mono h-16"
                              autoComplete="one-time-code"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-center" />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-3">
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Check className="mr-2 h-4 w-4" /> Verify & Create Account
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={() => setStep(1)}
                        disabled={loading}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Change Email / Back
                      </Button>
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-6 bg-muted/20">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
