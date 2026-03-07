import React from 'react';

import styles from './TimeStepper.module.css';

interface TimeStepperProps {
  value: number;
  onChange: (
    val: number,
    context?: { source: 'increment' | 'decrement' | 'input' | 'select'; wrapped?: boolean }
  ) => void;
  unit: string;
  className?: string;
  disabled?: boolean;
  step?: number;
  min?: number;
  max?: number;
  options?: number[];
  loopOptions?: boolean;
}

/**
 * 数値を増減させるためのステッパーコンポーネント
 * @param root0 プロパティオブジェクト
 * @param root0.value 現在の値
 * @param root0.onChange 値変更時のイベントハンドラ
 * @param root0.unit 単位（分など）
 * @param root0.className 追加のスタイルクラス
 * @param root0.disabled 無効フラグ
 * @param root0.step 増減幅
 * @param root0.min 最小値
 * @param root0.max 最大値
 * @param root0.options 選択肢（あればプルダウン形式になる）
 * @param root0.loopOptions 選択肢の先頭末尾で循環させるか
 * @returns レンダリングされるJSX要素
 */
export const TimeStepper: React.FC<TimeStepperProps> = ({
  value,
  onChange,
  unit,
  className,
  disabled,
  step = 5,
  min = 0,
  max,
  options,
  loopOptions = false,
}) => {
  const [displayValue, setDisplayValue] = React.useState<string>(value.toString());

  React.useEffect(() => {
    setDisplayValue(value.toString());
  }, [value]);

  const handleDecrement = () => {
    if (options) {
      const currentIndex = options.indexOf(value);
      if (currentIndex > 0) {
        onChange(options[currentIndex - 1], { source: 'decrement', wrapped: false });
      } else if (loopOptions && currentIndex === 0) {
        onChange(options[options.length - 1], { source: 'decrement', wrapped: true });
      } else if (currentIndex === -1) {
        // 現在の値がオプションにない場合は、最も近い小さい値を探す
        const smallerOptions = options.filter((o) => o < value);
        if (smallerOptions.length > 0) {
          onChange(Math.max(min, ...smallerOptions), { source: 'decrement', wrapped: false });
        }
      }
      return;
    }

    const newValue = Math.max(min, value - step);
    onChange(newValue, { source: 'decrement', wrapped: false });
  };

  const handleIncrement = () => {
    if (options) {
      const currentIndex = options.indexOf(value);
      if (currentIndex !== -1 && currentIndex < options.length - 1) {
        onChange(options[currentIndex + 1], { source: 'increment', wrapped: false });
      } else if (loopOptions && currentIndex === options.length - 1) {
        onChange(options[0], { source: 'increment', wrapped: true });
      } else if (currentIndex === -1) {
        // 現在の値がオプションにない場合は、最も近い大きい値を探す
        const largerOptions = options.filter((o) => o > value);
        if (largerOptions.length > 0) {
          onChange(Math.min(...largerOptions), { source: 'increment', wrapped: false });
        }
      }
      return;
    }

    let newValue = value + step;
    if (max !== undefined && newValue > max) newValue = max;
    onChange(newValue, { source: 'increment', wrapped: false });
  };

  const handleInputChange = (val: string) => {
    // 数字以外を削除
    const numericValue = val.replace(/\D/g, '');

    // 先頭の0を削除（ただし"0"自体の場合は残す）
    const sanitizedValue = numericValue.replace(/^0+/, '') || (numericValue === '' ? '' : '0');

    setDisplayValue(sanitizedValue);

    if (sanitizedValue !== '') {
      let num = parseInt(sanitizedValue, 10);
      if (num < min) num = min;
      if (max !== undefined && num > max) num = max;
      onChange(num, { source: 'input', wrapped: false });
    }
  };

  const handleBlur = () => {
    if (displayValue === '') {
      const fallbackValue = Math.max(min, value);
      setDisplayValue(fallbackValue.toString());
      onChange(fallbackValue, { source: 'input', wrapped: false });
    } else {
      // 最終的な値を確定させる
      let num = parseInt(displayValue, 10);
      if (num < min) num = min;
      if (max !== undefined && num > max) num = max;
      setDisplayValue(num.toString());
      onChange(num, { source: 'input', wrapped: false });
    }
  };

  const isDecrementDisabled = () => {
    if (disabled) return true;
    if (options) {
      if (loopOptions) return false;
      return options.includes(value) && options.indexOf(value) <= 0;
    }
    return value <= min;
  };

  const isIncrementDisabled = () => {
    if (disabled) return true;
    if (options) {
      if (loopOptions) return false;
      return options.includes(value) && options.indexOf(value) >= options.length - 1;
    }
    return max !== undefined && value >= max;
  };

  return (
    <div className={`${styles.stepperContainer} ${className ?? ''}`.trim()}>
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
              onChange(parseInt(e.target.value, 10), { source: 'select', wrapped: false });
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
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className={styles.stepperInput}
            value={displayValue}
            onChange={(e) => {
              handleInputChange(e.target.value);
            }}
            onBlur={handleBlur}
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
