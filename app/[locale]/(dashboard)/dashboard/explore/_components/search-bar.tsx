import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  placeholder: string;
}

export function SearchBar({ value, onChange, onFocus, placeholder }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-10 h-12 text-lg shadow-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={onFocus}
      />
    </div>
  );
}
