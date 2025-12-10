import ForgotPasswordForm from '@/components/auth/forgot-password-form';
import GuestGuard from '@/components/auth/guest-guard';

export default function ForgotPasswordPage() {
  return (
    <GuestGuard>
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>
        <ForgotPasswordForm />
      </div>
    </GuestGuard>
  );
}
