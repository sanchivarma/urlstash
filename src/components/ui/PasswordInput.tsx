import { useState, forwardRef } from 'react';
import { Info, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  showValidation?: boolean;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ value, onChange, placeholder = 'Password', showValidation = false, error }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    const validatePassword = (password: string) => {
      return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      };
    };

    const validation = validatePassword(value);
    const isValid = Object.values(validation).every(Boolean);

    return (
      <div className="space-y-2">
        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-3 pr-20 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {showTooltip && (
            <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password Requirements:
              </p>
              <ul className="space-y-1 text-sm">
                <li className={validation.length ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}>
                  {validation.length ? '✓' : '○'} At least 8 characters
                </li>
                <li className={validation.uppercase ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}>
                  {validation.uppercase ? '✓' : '○'} One uppercase letter (A-Z)
                </li>
                <li className={validation.lowercase ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}>
                  {validation.lowercase ? '✓' : '○'} One lowercase letter (a-z)
                </li>
                <li className={validation.number ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}>
                  {validation.number ? '✓' : '○'} One number (0-9)
                </li>
                <li className={validation.special ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}>
                  {validation.special ? '✓' : '○'} One special character (!@#$%^&*...)
                </li>
              </ul>
            </div>
          )}
        </div>

        {showValidation && value && !isValid && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Password does not meet all requirements
          </p>
        )}
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export function isPasswordValid(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  );
}

export function isEmailValid(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
