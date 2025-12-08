import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Database } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PasswordInput, isPasswordValid, isEmailValid } from '../../components/ui/PasswordInput';

export function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({ email: '', password: '', confirmPassword: '' });

    if (!isEmailValid(formData.email)) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address' }));
      showToast('error', 'Please enter a valid email address');
      return;
    }

    if (!isPasswordValid(formData.password)) {
      setErrors((prev) => ({ ...prev, password: 'Password does not meet requirements' }));
      showToast('error', 'Password does not meet requirements');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      showToast('error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password);

      if (error) {
        showToast('error', error.message || 'Failed to create account');
        return;
      }

      showToast('success', 'Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      showToast('error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">URLStash</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-slate-900 dark:text-white">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Or{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            sign in to existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-sm rounded-lg sm:px-10 border border-slate-200 dark:border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email address
              </label>
              <Input
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <PasswordInput
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                showValidation
                error={errors.password}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Confirm Password
              </label>
              <PasswordInput
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                error={errors.confirmPassword}
              />
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Create account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
