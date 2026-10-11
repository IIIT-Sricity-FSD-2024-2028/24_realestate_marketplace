import { useEffect, useRef, useState } from 'react';
import { restrictValue } from '../utils/validation.js';

/**
 * Label + input (or select/textarea) + inline error, used by every admin form.
 *
 * Props:
 *  - label, error         → text above / red message below the control
 *  - as                   → 'input' (default) | 'select' | 'textarea'
 *  - restrict             → 'alpha' | 'alphaList' | 'number' | 'email' — strips
 *                           disallowed characters while typing and briefly shows
 *                           a hint (port of tvRestrictInput)
 *  - variant              → 'dark' (modal forms) | 'soft' (profile form)
 *  - onValueChange(value) → receives the cleaned value
 * Any other prop (type, required, min, placeholder…) goes to the control.
 */
export default function FormField({
  label, error, as = 'input', restrict, variant = 'dark', onValueChange, className = '', labelClassName = '', children, ...controlProps
}) {
  const [hint, setHint] = useState(null);
  const hintTimer = useRef(null);
  useEffect(() => () => clearTimeout(hintTimer.current), []);

  const handleChange = (e) => {
    const { value, hint: newHint } = restrictValue(e.target.value, restrict);
    if (newHint) {
      setHint(newHint);
      clearTimeout(hintTimer.current);
      hintTimer.current = setTimeout(() => setHint(null), 2000);
    }
    onValueChange(value);
  };

  const Control = as;
  const controlClass = ['input', variant === 'soft' ? 'input--soft' : '', error ? 'input--invalid' : ''].join(' ').trim();

  return (
    <div className={className}>
      {label && <label className={'field-label ' + labelClassName}>{label}</label>}
      <Control className={controlClass} onChange={handleChange} aria-invalid={!!error} {...controlProps}>
        {children}
      </Control>
      {hint && <div className="field-hint">{hint}</div>}
      {error && <div className="field-error">⚠ {error}</div>}
    </div>
  );
}
