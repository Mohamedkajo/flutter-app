import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useRegister } from '@workspace/api-client-react';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import cargoLogo from '@assets/WhatsApp_Image_2026-07-16_at_19.29.03_1784465807906.jpeg';

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegister();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill in all required fields' });
      return;
    }

    registerMutation.mutate({ data: formData }, {
      onSuccess: (data) => {
        login(data.token, data.user);
        toast({ title: 'Welcome to Cargo!', description: 'Your account has been created successfully.' });
        setLocation('/');
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'Registration failed', description: 'Please check your details and try again.' });
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

      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full pb-12">
        <div className="w-20 h-20 rounded-full overflow-hidden mb-6 border-4 border-primary/20 p-1">
          <div className="w-full h-full rounded-full overflow-hidden">
            <img src={cargoLogo} alt="Cargo Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="w-full mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground">Sign up to get started with Cargo</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground px-1">Full Name *</label>
            <Input 
              type="text" 
              placeholder="John Doe" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="h-14 rounded-2xl bg-surface border-border/50 px-4"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground px-1">Email *</label>
            <Input 
              type="email" 
              placeholder="john@example.com" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="h-14 rounded-2xl bg-surface border-border/50 px-4"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground px-1">Phone Number (Optional)</label>
            <Input 
              type="tel" 
              placeholder="+971 50 123 4567" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="h-14 rounded-2xl bg-surface border-border/50 px-4"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground px-1">Password *</label>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Create a password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
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
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-lg mt-6 shadow-lg shadow-primary/20"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login">
            <span className="text-primary font-bold cursor-pointer hover:underline">Log In</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
