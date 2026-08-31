"use client";
// Button is defined in ./input.tsx alongside form primitives to keep imports tidy.
// This file re-exports it so any page that imports from '@/components/ui/button' still works.
export { Button } from "./input";
export type { ButtonProps } from "./input";
