import { forwardRef } from 'react'

export interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(function MenuItem(
  { className = '', children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={`block w-full px-3 py-1.5 text-left text-text-muted transition hover:bg-bg-subtle hover:text-text ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
})
