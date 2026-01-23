import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { authAPI } from '@/utils/api';
import { toast } from 'sonner';
import { useRouter } from '@/app/components/router';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { navigate } = useRouter();
  
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await authAPI.signIn(email, password);
      toast.success('Login successful!');
      navigate('/admin/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1D4ED8] to-[#1e40af] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Admin Login
            </h1>
            <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Thannmanngaadi Foundation
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@thannmanngaadi.org"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1D4ED8] hover:bg-[#1e40af] h-12"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          
          <p className="text-sm text-gray-600 text-center mt-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            Demo: Create an account first or use existing credentials
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
