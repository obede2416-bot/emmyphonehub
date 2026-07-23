import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Logo } from '@/components/Logo';
import toast from 'react-hot-toast';

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm: z.string(),
}).refine((data) => data.password === data.confirm, { message: 'Passwords do not match', path: ['confirm'] });

type FormData = z.infer<typeof schema>;

export function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await signUp(data.email, data.password, data.full_name);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (e: any) {
      toast.error(e.message ?? 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app section-padding py-12">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-6">
          <Logo size="lg" className="justify-center" />
          <h1 className="font-display text-2xl font-bold mt-4">Create Account</h1>
          <p className="text-slate-500 text-sm">Join PhoneHub and start shopping</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input {...register('full_name')} className="input pl-10" placeholder="John Doe" />
              </div>
              {errors.full_name && <p className="text-xs text-secondary-500 mt-1">{errors.full_name.message}</p>}
            </div>

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

            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPass ? 'text' : 'password'} {...register('confirm')} className="input pl-10" placeholder="••••••••" />
              </div>
              {errors.confirm && <p className="text-xs text-secondary-500 mt-1">{errors.confirm.message}</p>}
            </div>

            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input type="checkbox" required className="mt-1 accent-primary-600" />
              <span className="text-slate-600 dark:text-slate-400">I agree to the <Link to="/terms" className="text-primary-600 hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link></span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : <><UserPlus size={18} /> Create Account</>}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
