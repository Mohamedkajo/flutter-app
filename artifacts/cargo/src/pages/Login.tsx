import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useLogin } from '@workspace/api-client-react';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import cargoLogo from '@assets/WhatsApp_Image_2026-07-16_at_19.29.03_1784465807906.jpeg';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill in all fields' });
      return;
    }

    loginMutation.mutate({ data: { email, password } }, {
      onSuccess: (data) => {
        login(data.token, data.user);
        toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
        
        // Redirect based on role
        if (data.user.role === 'admin') setLocation('/admin');
        else if (data.user.role === 'merchant') setLocation('/merchant');
        else if (data.user.role === 'driver') setLocation('/driver');
        else setLocation('/');
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'Login failed', description: 'Invalid email or password' });
      }
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="p-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="rounded-full bg-surface">
          <ChevronLeft size={24} />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-8 border-4 border-primary/20 p-1">
          <div className="w-full h-full rounded-full overflow-hidden">
            <img src={cargoLogo} alt="Cargo Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="w-full mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Log in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground px-1">Email</label>
            <Input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-2xl bg-surface border-border/50 px-4"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground px-1">Password</label>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 rounded-2xl bg-surface border-border/50 px-4 pr-12"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="flex justify-end pt-1">
              <Button variant="link" className="text-primary text-xs p-0 h-auto font-semibold">Forgot Password?</Button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-lg mt-6 shadow-lg shadow-primary/20"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/register">
            <span className="text-primary font-bold cursor-pointer hover:underline">Sign Up</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
