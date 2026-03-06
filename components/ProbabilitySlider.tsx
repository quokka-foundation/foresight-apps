'use client';

import { useCallback, useState } from 'react';

interface ProbabilitySliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export function ProbabilitySlider({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 0.1,
  disabled = false,
}: ProbabilitySliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(e.target.value));
    },
    [onChange]
  );

  const fillPercent = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      {/* Value display */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-ios-text-secondary font-medium">Probability</span>
        <span
          className={`text-3xl font-extrabold font-mono transition-transform duration-150 tracking-tighter ${
            isDragging ? 'scale-110 text-ios-blue' : 'text-ios-text'
          }`}
        >
          {value.toFixed(1)}%
        </span>
      </div>

      {/* Slider — thicker track, larger handle */}
      <div className="relative py-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          disabled={disabled}
          className="w-full h-2 rounded-pill appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, #0052FF 0%, #0052FF ${fillPercent}%, #E8ECF0 ${fillPercent}%, #E8ECF0 100%)`,
          }}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-ios-text-tertiary font-medium">Very Unlikely</span>
        <span className="text-[10px] text-ios-text-tertiary font-medium">50/50</span>
        <span className="text-[10px] text-ios-text-tertiary font-medium">Very Likely</span>
      </div>
    </div>
  );
}
