'use client';

import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

export default function GoogleLoginBtn() {
  const router = useRouter();

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={async (res) => {
          try {
            const idToken = res.credential;
            const apiRes = await authService.googleLogin(idToken);
            toast.success(apiRes.message);
            router.push('/drive');
          } catch (err) {
            toast.error(err.response?.data?.message || 'Google Login failed');
          }
        }}
        onError={() => toast.error('Google Login failed')}
      />
    </div>
  );
}
