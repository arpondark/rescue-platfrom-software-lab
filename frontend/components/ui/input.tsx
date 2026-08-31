"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap",
  {
    variants: {
      variant: {
        primary: "bg-signal text-paper border border-signal hover:bg-signal-600",
        secondary: "bg-paper text-ink border border-ink-300 hover:bg-paper-200",
        ghost: "text-ink hover:bg-paper-200",
        danger: "bg-ink text-paper border border-ink hover:bg-ink-100",
        outline: "bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper",
        link: "text-signal underline-offset-4 hover:underline px-0 py-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-9 w-full rounded bg-surface border border-ink-300 px-3 text-sm text-ink placeholder:text-mist focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded bg-surface border border-ink-300 px-3 py-2 text-sm text-ink placeholder:text-mist focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "block text-xs font-semibold uppercase tracking-eyebrow text-slate-400 mb-1.5",
        className
      )}
      {...props}
    />
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-signal-600">{children}</p>;
}

export function HelpText({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-mist">{children}</p>;
}
