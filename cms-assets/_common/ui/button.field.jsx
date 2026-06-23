import React from 'react';

/**
 * A customizable button component with multiple style variants.
 *
 * @param {'quote' | 'help' | 'submit' | 'cancel' | 'confirm' | 'change'} variant - Defines the button style variant.
 * @param {React.ReactNode} children - The button's content.
 * @param {() => void} [onClick] - Callback function triggered on button click.
 * @param {string} [className=''] - Additional classes for custom styling.
 * @param {boolean} [insideContainer=''] - Flag for inverting button background when inside container.
 * @param {boolean} [disabled=false] - Disables the button when set to `true`.
 * @param {string} [dataTestID] - Identifier for button. */
export default function ButtonField({
  variant,
  children,
  onClick,
  overlay,
  className = '',
  insideContainer = false,
  disabled = false,
  rounded = true,
  dataTestID,
}) {
  const baseClass = `disabled:bg-[var(--btn-disabled-bg)] [:not(:disabled)]:cursor-pointer text-base transition duration-200 ease-in-out ${rounded ? 'rounded-full' : 'rounded-none'} h-[var(--btn-height)] ${className}`;
  const styles = {
    quote: `${'bg-[var(--brand-primary)] text-[var(--brand-primary-text)] disabled:!bg-[var(--brand-primary)] disabled:!text-[var(--brand-primary-text)] hover:bg-[var(--brand-primary-hovered)]'}`,
    help: 'bg-[var(--btn-help-bg)] text-[var(--btn-help-text)]',
    submit: 'bg-[var(--btn-submit-bg)] text-[var(--btn-submit-text)]',
    cancel: 'bg-[var(--btn-cancel-bg)] text-[var(--btn-cancel-text)] ',
    change: `border-[var(--btn-change-border)] border ${insideContainer ? 'bg-white' : 'bg-[var(--btn-bg)]'} text-[var(--btn-change-text)] hover:border-transparent hover:bg-[var(--btn-change-bg-hovered)] ${disabled ? 'text-white' : 'text-[var(--btn-change-text)]'}`,
    confirm: `flex justify-center items-center ${disabled ? 'bg-[var(--btn-disabled-bg)]' : 'p-px bg-[image:var(--btn-confirm-gradient)]'}`,
  };
  const confirmButtonClass = `h-[95%] w-[99%] p-2 ${insideContainer ? 'bg-white' : 'bg-[var(--btn-bg)]'} rounded-full hover:bg-transparent hover:text-white disabled:bg-[var(--btn-disabled-bg)] disabled:text-white [:not(:disabled)]:cursor-pointer transition-colors`;

  return (
    <>
      {variant !== 'confirm' && (
        <button
          data-testid={dataTestID}
          onClick={onClick}
          disabled={disabled}
          className={`${baseClass} ${styles[variant]}`}
        >
          {children}
        </button>
      )}
      {variant === 'confirm' && (
        <div className={`${baseClass} ${styles[variant]}`}>
          <button
            data-testid={dataTestID}
            onClick={onClick}
            disabled={disabled}
            className={confirmButtonClass}
          >
            {children}
          </button>
        </div>
      )}
    </>
  );
}
