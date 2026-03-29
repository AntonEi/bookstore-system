import * as React from 'react';
import styles from './Button.module.scss';

type Variant = 'primary' | 'secondary' | 'outline' | 'primaryInCard'   | 'secondaryInCard';

interface ButtonProps {
  children: React.ReactNode;
  variant?: Variant;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  disabled,
  type = 'button'
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.button} ${styles[variant]}`}
    >
      {children}
    </button>
  );
};

export default Button;