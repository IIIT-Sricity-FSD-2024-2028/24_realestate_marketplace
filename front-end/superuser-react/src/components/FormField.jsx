/**
 * Reusable form field wrapping label, control, and error text.
 */
export default function FormField({
  label,
  error,
  as = 'input',
  className = '',
  labelClassName = '',
  children,
  ...controlProps
}) {
  const Control = as;
  const controlClass = ['form-control', error ? 'form-control--invalid' : ''].join(' ').trim();

  return (
    <div className={'form-group ' + className}>
      {label && <label className={'form-label ' + labelClassName}>{label}</label>}
      <Control className={controlClass} aria-invalid={!!error} {...controlProps}>
        {children}
      </Control>
      {error && <div className="error-text">⚠ {error}</div>}
    </div>
  );
}
