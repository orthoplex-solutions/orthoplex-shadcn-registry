'use client';

import * as React from 'react';

export interface MaskedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Mask pattern where:
   * 9 = digit (0-9)
   * a = letter (A-Z)
   * * = alphanumeric
   * Other characters = literal (shown as-is)
   *
   * Examples:
   * "(999) 999-9999" for phone
   * "99/99/9999" for date
   * "a9a 9a9" for postal code
   */
  mask: string;

  /**
   * Called when value changes with both formatted and clean values
   * formatted: "(555) 555-5555"
   * unformatted: "5555555555"
   */
  onMaskedChange?: (formatted: string, unformatted: string) => void;
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  (
    {
      className,
      mask,
      onChange,
      onMaskedChange,
      value: controlledValue,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = React.useState<string>('');
    const displayValue =
      controlledValue !== undefined ? controlledValue : value;

    /**
     * Check if character matches mask pattern
     * '9' only accepts digits
     * 'a' only accepts letters
     * '*' accepts both
     */
    const charMatchesMask = (char: string, maskChar: string): boolean => {
      if (maskChar === '9') return /\d/.test(char);
      if (maskChar === 'a') return /[A-Za-z]/.test(char);
      if (maskChar === '*') return /[A-Za-z0-9]/.test(char);
      return false;
    };

    /**
     * Format input according to mask
     *
     * Example:
     * Input: "5555555555"
     * Mask: "(999) 999-9999"
     * Output: "(555) 555-5555"
     */
    const formatToMask = (
      inputValue: string
    ): { formatted: string; unformatted: string } => {
      let formatted = '';
      let unformatted = '';
      let inputIndex = 0;

      for (let maskIndex = 0; maskIndex < mask.length; maskIndex++) {
        const maskChar = mask[maskIndex];

        // If mask position is a placeholder (9, a, or *)
        if (['9', 'a', '*'].includes(maskChar)) {
          if (inputIndex < inputValue.length) {
            const char = inputValue[inputIndex];

            // Check if typed character matches the mask requirement
            if (charMatchesMask(char, maskChar)) {
              formatted += char;
              unformatted += char;
              inputIndex++;
            }
            // Skip this mask position if char doesn't match
          } else {
            // No more input, stop formatting
            break;
          }
        } else {
          // This is a literal character (like parenthesis, dash, space)
          if (
            inputIndex < inputValue.length &&
            inputValue[inputIndex] === maskChar
          ) {
            // User typed the literal character
            formatted += maskChar;
            inputIndex++;
          } else if (inputIndex < inputValue.length) {
            // User didn't type the literal, try to auto-insert it
            const nextMaskIndex = maskIndex + 1;
            if (
              nextMaskIndex < mask.length &&
              ['9', 'a', '*'].includes(mask[nextMaskIndex])
            ) {
              if (
                charMatchesMask(inputValue[inputIndex], mask[nextMaskIndex])
              ) {
                formatted += maskChar;
              } else {
                break;
              }
            } else {
              formatted += maskChar;
            }
          } else {
            // No more input, stop
            break;
          }
        }
      }

      return {
        formatted,
        unformatted,
      };
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;

      // Extract only alphanumeric characters (remove any formatting)
      const validChars = inputValue
        .split('')
        .filter((char) => /[A-Za-z0-9]/.test(char))
        .join('');

      const { formatted, unformatted } = formatToMask(validChars);

      // Update state if uncontrolled component
      if (controlledValue === undefined) {
        setValue(formatted);
      }

      // Call onChange with formatted value
      if (onChange) {
        e.target.value = formatted;
        onChange(e);
      }

      // Call custom callback with both versions
      if (onMaskedChange) {
        onMaskedChange(formatted, unformatted);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowedKeys = [
        'Backspace',
        'Delete',
        'ArrowLeft',
        'ArrowRight',
        'Tab',
        'Enter',
      ];

      const isModifierKey = e.ctrlKey || e.metaKey || e.altKey || e.shiftKey;

      // Allow modifier keys (Ctrl+C, Ctrl+V, etc.)
      if (isModifierKey) return;

      // Allow allowed keys
      if (allowedKeys.includes(e.key)) return;

      // Allow valid characters based on mask
      if (/[A-Za-z0-9]/.test(e.key)) return;

      // Block everything else
      e.preventDefault();
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData('text/plain');

      // Extract only alphanumeric from pasted text
      const validChars = pastedText
        .split('')
        .filter((char) => /[A-Za-z0-9]/.test(char))
        .join('');

      const { formatted, unformatted } = formatToMask(validChars);

      if (controlledValue === undefined) {
        setValue(formatted);
      }

      const input = e.currentTarget;
      input.value = formatted;

      if (onChange) {
        onChange({
          ...e,
          target: input,
        } as React.ChangeEvent<HTMLInputElement>);
      }

      if (onMaskedChange) {
        onMaskedChange(formatted, unformatted);
      }
    };

    return (
      <input
        className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          className || ''
        }`}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        ref={ref}
        {...props}
      />
    );
  }
);

MaskedInput.displayName = 'MaskedInput';

export { MaskedInput };
