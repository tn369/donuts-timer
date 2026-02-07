import React from 'react';

import styles from './TimeStepper.module.css';

interface TimeStepperProps {
  value: number;
  onChange: (val: number) => void;
  unit: string;
  disabled?: boolean;
  step?: number;
  max?: number;
  options?: number[];
}

/**
 * 数値を増減させるためのステッパーコンポーネント
 */
export const TimeStepper: React.FC<TimeStepperProps> = ({
  value,
  onChange,
  unit,
  disabled,
  step = 5,
  max,
  options,
}) => {
  const handleDecrement = () => {
    if (options) {
      const currentIndex = options.indexOf(value);
      if (currentIndex > 0) {
        onChange(options[currentIndex - 1]);
      } else if (currentIndex === -1) {
        // 現在の値がオプションにない場合は、最も近い小さい値を探す
        const smallerOptions = options.filter((o) => o < value);
        if (smallerOptions.length > 0) {
          onChange(Math.max(...smallerOptions));
        }
      }
      return;
    }

    const newValue = Math.max(0, value - step);
    onChange(newValue);
  };

  const handleIncrement = () => {
    if (options) {
      const currentIndex = options.indexOf(value);
      if (currentIndex !== -1 && currentIndex < options.length - 1) {
        onChange(options[currentIndex + 1]);
      } else if (currentIndex === -1) {
        // 現在の値がオプションにない場合は、最も近い大きい値を探す
        const largerOptions = options.filter((o) => o > value);
        if (largerOptions.length > 0) {
          onChange(Math.min(...largerOptions));
        }
      }
      return;
    }

    let newValue = value + step;
    if (max !== undefined && newValue > max) newValue = max;
    onChange(newValue);
  };

  const isDecrementDisabled = () => {
    if (disabled) return true;
    if (options) {
      return options.includes(value) && options.indexOf(value) <= 0;
    }
    return value <= 0;
  };

  const isIncrementDisabled = () => {
    if (disabled) return true;
    if (options) {
      return options.includes(value) && options.indexOf(value) >= options.length - 1;
    }
    return max !== undefined && value >= max;
  };

  return (
    <div className={styles.stepperContainer}>
      <button
        type="button"
        className={styles.stepperBtn}
        onClick={handleDecrement}
        disabled={isDecrementDisabled()}
      >
        -
      </button>
      <div className={styles.stepperValueContainer}>
        {options ? (
          <select
            className={styles.stepperInput}
            value={value}
            onChange={(e) => {
              onChange(parseInt(e.target.value));
            }}
            disabled={disabled}
            style={{ appearance: 'none', background: 'transparent', textAlign: 'center' }}
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="number"
            className={styles.stepperInput}
            value={value}
            onChange={(e) => {
              onChange(parseInt(e.target.value || '0'));
            }}
            disabled={disabled}
          />
        )}
        <span className={styles.stepperUnit}>{unit}</span>
      </div>
      <button
        type="button"
        className={styles.stepperBtn}
        onClick={handleIncrement}
        disabled={isIncrementDisabled()}
      >
        +
      </button>
    </div>
  );
};
