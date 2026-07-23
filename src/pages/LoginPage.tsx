import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Logo } from '@/components/Logo';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/account';
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
      toast.success('Welcome back!');
      navigate(redirect);
    } catch (e: any) {
      toast.error(e.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app section-padding py-12">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-6">
          <Logo size="lg" className="justify-center" />
          <h1 className="font-display text-2xl font-bold mt-4">Welcome Back</h1>
          <p className="text-slate-500 text-sm">Sign in to your PhoneHub account</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" {...register('email')} className="input pl-10" placeholder="you@example.com" />
              </div>
              {errors.email && <p className="text-xs text-secondary-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPass ? 'text' : 'password'} {...register('password')} className="input pl-10 pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-secondary-500 mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-primary-600" /> Remember me
              </label>
              <Link to="/forgot-password" className="text-primary-600 hover:underline">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-slate-500">
            Don't have an account? <Link to="/signup" className="text-primary-600 font-semibold hover:underline">Sign up</Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Admin? Sign in with an admin account to access the dashboard.
        </p>
      </div>
    </div>
  );
}
