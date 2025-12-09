interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function OTPInput({ value, onChange, error, disabled = false }: OTPInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Only allow digits and max 6 characters
    if (/^\d{0,6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div>
      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="000000"
        className={`w-full px-3 py-2.5 text-center text-lg font-semibold tracking-widest bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label="Enter 6-digit OTP"
      />
      {error && <p className="text-red-500 text-xs mt-1 text-center">{error}</p>}
    </div>
  );
}
