import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background overflow-hidden active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-700 hover:to-indigo-800 focus-visible:ring-blue-500 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100',
        
        destructive:
          'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:from-red-600 hover:to-rose-700 focus-visible:ring-red-500 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100',
        
        outline:
          'border-2 border-gray-200 bg-white/80 backdrop-blur-sm text-gray-700 shadow-sm hover:bg-white hover:border-gray-300 hover:shadow-md hover:text-gray-900 focus-visible:ring-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:border-gray-600 dark:hover:text-gray-100',
        
        secondary:
          'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 shadow-sm hover:from-gray-200 hover:to-gray-300 hover:shadow-md hover:text-gray-900 focus-visible:ring-gray-400 dark:from-gray-700 dark:to-gray-800 dark:text-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-700 dark:hover:text-white',
        
        ghost:
          'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 hover:shadow-sm focus-visible:ring-gray-400 dark:text-gray-300 dark:hover:bg-gray-800/50 dark:hover:text-gray-100',
        
        link: 
          'text-blue-600 underline-offset-4 hover:underline hover:text-blue-800 focus-visible:ring-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200',

        premium:
          'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50 hover:from-violet-700 hover:to-indigo-700 focus-visible:ring-purple-500 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 after:absolute after:inset-0 after:rounded-xl after:bg-gradient-to-r after:from-white/10 after:via-transparent after:to-white/10 after:animate-shimmer',

        glass:
          'bg-white/20 backdrop-blur-md border border-white/30 text-gray-800 shadow-xl hover:bg-white/30 hover:border-white/40 focus-visible:ring-white/50 dark:bg-gray-900/20 dark:border-gray-700/50 dark:text-gray-200 dark:hover:bg-gray-800/30',
      },
      size: {
        sm: 'h-8 px-3 py-1.5 text-xs rounded-lg gap-1.5 has-[>svg]:px-2.5',
        default: 'h-10 px-6 py-2.5 has-[>svg]:px-4',
        lg: 'h-12 px-8 py-3 text-base rounded-2xl has-[>svg]:px-6',
        xl: 'h-14 px-10 py-4 text-lg rounded-2xl has-[>svg]:px-8 font-bold',
        icon: 'size-10 rounded-xl',
        'icon-sm': 'size-8 rounded-lg',
        'icon-lg': 'size-12 rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
      {/* Ripple effect overlay */}
      <span className="absolute inset-0 overflow-hidden rounded-inherit">
        <span className="absolute inset-0 rounded-inherit bg-white/10 opacity-0 transition-opacity duration-150 group-active:opacity-100" />
      </span>
    </Comp>
  )
}

// Enhanced button with loading state
function LoadingButton({ 
  loading = false, 
  children, 
  className,
  ...props 
}) {
  return (
    <Button 
      className={cn("relative", className)} 
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-4 animate-spin" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      <span className={cn("transition-opacity duration-200", loading && "opacity-0")}>
        {children}
      </span>
    </Button>
  )
}

// Floating Action Button variant
function FloatingButton({ className, children, ...props }) {
  return (
    <Button
      className={cn(
        "fixed bottom-6 right-6 size-14 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 z-50",
        className
      )}
      size="icon"
      {...props}
    >
      {children}
    </Button>
  )
}

export { Button, LoadingButton, FloatingButton, buttonVariants }