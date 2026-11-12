import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';

/**
 * Animated slot-machine counter: outgoing number falls downward,
 * incoming number enters from above using pure CSS keyframes.
 */
export default function RollingNumber({ value, className = '', ariaLabel }) {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState(null);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (value === current) return undefined;
    setPrevious(current);
    setCurrent(value);
    setAnimKey((k) => k + 1);

    // Clear the outgoing ghost after its 160ms exit animation completes
    const t = setTimeout(() => setPrevious(null), 170);
    return () => clearTimeout(t);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden',
        className
      )}
      style={{ height: '1.3em', minWidth: '1.5ch' }}
      aria-live='polite'
      aria-label={ariaLabel ?? `المتبقي ${value}`}>
      {previous !== null && (
        <span
          key={`out-${animKey}`}
          className='number-roll-out'
          aria-hidden='true'>
          {previous}
        </span>
      )}
      <span
        key={`in-${animKey}`}
        className='number-roll-in'>
        {current}
      </span>
    </span>
  );
}
