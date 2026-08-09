import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchInput({ value, onChange, placeholder = 'Search...' }: SearchInputProps) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-[13px] text-gray-900 placeholder-gray-400 focus:border-[#2E86AB] focus:ring-2 focus:ring-[#2E86AB]/20 focus:outline-none transition-all shadow-md"
      />
    </div>
  );
}
