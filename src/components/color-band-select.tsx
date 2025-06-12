import type React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ColorInfo } from '@/lib/resistor-calc';

interface ColorBandSelectProps {
  label: string;
  value: string | undefined; // Name of the color
  onChange: (colorName: string) => void;
  options: ColorInfo[];
  disabled?: boolean;
  placeholder?: string;
}

const ColorBandSelect: React.FC<ColorBandSelectProps> = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  placeholder = "Select color"
}) => {
  const selectedColorInfo = options.find(opt => opt.name === value);

  return (
    <div className="flex flex-col space-y-1.5">
      <label htmlFor={label.toLowerCase().replace(/\s+/g, '-')} className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={label.toLowerCase().replace(/\s+/g, '-')}>
          <SelectValue placeholder={placeholder}>
            {selectedColorInfo ? (
              <div className="flex items-center">
                <span
                  className="inline-block w-4 h-4 rounded-sm mr-2 border border-foreground/20"
                  style={{ backgroundColor: selectedColorInfo.cssColor }}
                />
                {selectedColorInfo.name}
              </div>
            ) : (
              placeholder
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.name} value={option.name}>
              <div className="flex items-center">
                <span
                  className="inline-block w-4 h-4 rounded-sm mr-2 border border-foreground/20"
                  style={{ backgroundColor: option.cssColor }}
                />
                {option.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ColorBandSelect;
