import * as React from 'react';
import { cn } from '@/lib/utils';

const Card        = React.forwardRef(({ className, ...p }, ref) => <div ref={ref} className={cn('rounded-xl border bg-card text-card-foreground shadow-sm', className)} {...p} />);
const CardHeader  = React.forwardRef(({ className, ...p }, ref) => <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...p} />);
const CardTitle   = React.forwardRef(({ className, ...p }, ref) => <h3 ref={ref} className={cn('font-semibold leading-none tracking-tight', className)} {...p} />);
const CardContent = React.forwardRef(({ className, ...p }, ref) => <div ref={ref} className={cn('p-6 pt-0', className)} {...p} />);
const CardFooter  = React.forwardRef(({ className, ...p }, ref) => <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...p} />);

Card.displayName        = 'Card';
CardHeader.displayName  = 'CardHeader';
CardTitle.displayName   = 'CardTitle';
CardContent.displayName = 'CardContent';
CardFooter.displayName  = 'CardFooter';

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
