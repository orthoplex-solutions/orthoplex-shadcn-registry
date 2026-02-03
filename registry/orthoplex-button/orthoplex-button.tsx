import * as React from 'react';

export interface OrthoplexButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const OrthoplexButton = React.forwardRef<
  HTMLButtonElement,
  OrthoplexButtonProps
>(({ className, ...props }, ref) => (
  <button
    className={`px-4 py-2 rounded-md font-medium text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 transition-colors ${
      className || ''
    }`}
    ref={ref}
    {...props}
  />
));

OrthoplexButton.displayName = 'OrthoplexButton';

export { OrthoplexButton };
