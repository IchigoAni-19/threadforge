import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/**
 * Labeled text input with optional error message.
 * `extends InputHTMLAttributes` means we inherit type, placeholder, required, etc.
 */
export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input id={inputId} className={`input-field ${className}`} {...props} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
