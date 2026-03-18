import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ToastProvider   = ToastPrimitive.Provider;
const ToastViewport   = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport ref={ref}
    className={cn('fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-sm', className)}
    {...props} />
));
ToastViewport.displayName = 'ToastViewport';

const Toast = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
  <ToastPrimitive.Root ref={ref}
    className={cn('group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out',
      variant === 'destructive'
        ? 'border-destructive bg-destructive text-destructive-foreground'
        : 'border bg-card text-card-foreground', className)}
    {...props} />
));
Toast.displayName = 'Toast';

const ToastTitle       = React.forwardRef(({ className, ...p }, ref) => <ToastPrimitive.Title ref={ref} className={cn('text-sm font-semibold', className)} {...p} />);
const ToastDescription = React.forwardRef(({ className, ...p }, ref) => <ToastPrimitive.Description ref={ref} className={cn('text-sm opacity-90', className)} {...p} />);
const ToastClose       = React.forwardRef(({ className, ...p }, ref) => (
  <ToastPrimitive.Close ref={ref} className={cn('absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100', className)} {...p}>
    <X className="h-4 w-4" />
  </ToastPrimitive.Close>
));
ToastTitle.displayName       = 'ToastTitle';
ToastDescription.displayName = 'ToastDescription';
ToastClose.displayName       = 'ToastClose';

// ── Toaster state (simple singleton) ──────────────────────────
const listeners = [];
let state = { toasts: [] };
let id = 0;

function dispatch(action) {
  if (action.type === 'ADD') {
    state = { toasts: [action.toast, ...state.toasts].slice(0, 3) };
  } else if (action.type === 'REMOVE') {
    state = { toasts: state.toasts.filter((t) => t.id !== action.id) };
  }
  listeners.forEach((l) => l(state));
}

export function toast({ title, description, variant } = {}) {
  const toastId = ++id;
  dispatch({ type: 'ADD', toast: { id: toastId, title, description, variant, open: true } });
  setTimeout(() => dispatch({ type: 'REMOVE', id: toastId }), 4000);
}

export function useToast() {
  const [s, setS] = React.useState(state);
  React.useEffect(() => {
    listeners.push(setS);
    return () => { const i = listeners.indexOf(setS); if (i > -1) listeners.splice(i, 1); };
  }, []);
  return { toasts: s.toasts };
}

export function Toaster() {
  const { toasts } = useToast();
  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, variant }) => (
        <Toast key={id} variant={variant}>
          <div>
            {title       && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
