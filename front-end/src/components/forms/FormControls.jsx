/**
 * FormControls.jsx
 * Purpose: Accessible form pieces that carry over form-validation.js behaviour:
 *          labelled fields with inline error text, inputs that strip disallowed
 *          characters while typing (with a short hint), password show/hide,
 *          and the live "passwords match" indicator.
 * Inputs:  props documented on each component.
 * Outputs: JSX form controls; values are reported through onValueChange(value).
 * API calls: none.
 */
import { useEffect, useRef, useState } from 'react';
import Icon from '../common/Icon.jsx';
import { RESTRICT_HINTS, sanitizeInput } from '../../utils/validation.js';
import './FormControls.css';

/**
 * Label + control + optional hint + optional error.
 * Props: id (must match the control's id), label, required, error, hint, className.
 */
export function FormField({ id, label, required, error, hint, className = '', children }) {
  return (
    <div className={'form-group ' + className}>
      {label && (
        <label className="form-label" htmlFor={id}>
          {label}
          {required && (
            <span className="required-mark" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      )}
      {children}
      {hint && !error && <div className="field-hint">{hint}</div>}
      {error && (
        <div className="field-error" id={id + '-error'} role="alert">
          ⚠ {error}
        </div>
      )}
    </div>
  );
}

/**
 * Text input that cleans its own value (old tvRestrictInput).
 * Props: restrict – 'alpha' | 'number' | 'phone' | 'email' | undefined,
 *        value, onValueChange(cleanValue), error (adds red border + aria-invalid),
 *        plus any normal <input> prop.
 */
export function TextInput({ restrict, value, onValueChange, error, className = '', id, ...rest }) {
  const [hint, setHint] = useState(''); // short "only numbers…" notice
  const timer = useRef(null);

  // Clear the hint timer if the component disappears.
  useEffect(() => () => window.clearTimeout(timer.current), []);

  /** Shows a hint for 2 seconds (same as the old floating pill). */
  const flashHint = (text) => {
    setHint(text);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setHint(''), 2000);
  };

  const handleChange = (event) => {
    const { value: cleaned, changed } = sanitizeInput(event.target.value, restrict);
    if (changed && restrict) flashHint(RESTRICT_HINTS[restrict]);
    // Phone numbers made only of zeros are rejected straight away.
    if (restrict === 'phone') {
      const digits = cleaned.replace(/[^0-9]/g, '');
      if (digits.length >= 7 && /^0+$/.test(digits)) {
        flashHint('Phone number cannot be all zeros');
        onValueChange('');
        return;
      }
    }
    onValueChange(cleaned);
  };

  return (
    <>
      <input
        id={id}
        className={'form-control ' + (error ? 'is-invalid ' : '') + className}
        value={value ?? ''}
        onChange={handleChange}
        aria-invalid={error ? 'true' : undefined}
        // Only point at an error message when FormField actually renders one.
        aria-describedby={typeof error === 'string' && error ? id + '-error' : undefined}
        {...rest}
      />
      {hint && (
        <span className="input-hint" role="status">
          ⚠️ {hint}
        </span>
      )}
    </>
  );
}

/**
 * Password input with an eye button to show/hide the text.
 * Props: value, onValueChange, id, error, plus normal input props.
 */
export function PasswordInput({ value, onValueChange, id, error, className = '', ...rest }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password-wrap">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        className={'form-control ' + (error ? 'is-invalid ' : '') + className}
        value={value ?? ''}
        onChange={(event) => onValueChange(event.target.value)}
        aria-invalid={error ? 'true' : undefined}
        {...rest}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        <Icon name={visible ? 'eyeOff' : 'eye'} />
      </button>
    </div>
  );
}

/**
 * Live ✅/❌ indicator under a confirm-password box (old tvWirePasswordMatch).
 * Props: password, confirm. Hidden until the user types a confirmation.
 */
export function PasswordMatchHint({ password, confirm }) {
  if (!confirm || !password) return null;
  const match = password === confirm;
  return (
    <div className={'match-hint ' + (match ? 'match-ok' : 'match-bad')} role="status">
      {match ? '✅ Passwords match' : "❌ Passwords don't match"}
    </div>
  );
}

/** Today as YYYY-MM-DD — the max allowed for date-of-birth pickers. */
export function todayIso() {
  return new Date().toISOString().split('T')[0];
}
