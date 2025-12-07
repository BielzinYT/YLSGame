
import React, { useEffect, useState, useRef } from 'react';

interface LiveNumberProps {
  value: number;
  className?: string;
  format?: boolean;
  prefix?: string;
}

export const LiveNumber: React.FC<LiveNumberProps> = ({ value, className = "", format = true, prefix = "" }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (value === displayValue) return;

    const diff = value - displayValue;
    const steps = 10;
    const increment = diff / steps;
    let current = displayValue;
    let stepCount = 0;

    timerRef.current = setInterval(() => {
      stepCount++;
      current += increment;
      
      if (stepCount >= steps) {
        setDisplayValue(value);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, 50);

    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [value]);

  const formatted = format 
    ? displayValue.toLocaleString() 
    : displayValue.toString();

  return (
    <span className={className}>
      {prefix}{formatted}
    </span>
  );
};
