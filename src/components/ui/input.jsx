import * as React from 'react'
import { cva } from 'class-variance-authority'
import { EyeIcon, EyeOffIcon, SearchIcon, CheckIcon, XIcon } from 'lucide-react'

import { cn } from '../../lib/utils'

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex w-full min-w-0 border bg-transparent text-base shadow-sm transition-all duration-300 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm peer",
  {
    variants: {
      variant: {
        default: 
          "border-gray-200 rounded-xl h-12 px-4 py-3 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-gray-600 dark:focus:border-blue-400",
        
        filled:
          "border-transparent rounded-xl h-12 px-4 py-3 bg-gray-50 hover:bg-gray-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:bg-gray-800 dark:focus:border-blue-400",
        
        outlined:
          "border-2 border-gray-200 rounded-xl h-12 px-4 py-3 hover:border-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:hover:border-gray-500 dark:focus:border-blue-400",
        
        underlined:
          "border-0 border-b-2 border-gray-200 rounded-none h-12 px-2 py-3 hover:border-gray-400 focus:border-blue-500 dark:border-gray-600 dark:hover:border-gray-500 dark:focus:border-blue-400",
        
        glass:
          "border border-white/20 rounded-2xl h-12 px-4 py-3 bg-white/10 backdrop-blur-xl hover:bg-white/20 focus:bg-white/30 focus:border-white/40 focus:ring-4 focus:ring-white/10 dark:bg-gray-900/20 dark:hover:bg-gray-800/30 dark:focus:bg-gray-700/30",
        
        gradient:
          "border-0 rounded-2xl h-12 px-4 py-3 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 hover:from-blue-100 hover:via-purple-100 hover:to-pink-100 focus:from-blue-100 focus:via-purple-100 focus:to-pink-100 focus:ring-4 focus:ring-purple-500/20 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 dark:hover:from-gray-700 dark:hover:via-gray-600 dark:hover:to-gray-700",
        
        neon:
          "border-2 border-cyan-400/50 rounded-xl h-12 px-4 py-3 bg-cyan-950/20 hover:border-cyan-400/70 hover:bg-cyan-950/30 focus:border-cyan-400 focus:bg-cyan-950/40 focus:ring-4 focus:ring-cyan-400/20 focus:shadow-lg focus:shadow-cyan-400/25 text-cyan-100 placeholder:text-cyan-300/70",
      },
      size: {
        sm: "h-9 px-3 py-2 text-sm rounded-lg",
        default: "h-12 px-4 py-3",
        lg: "h-14 px-5 py-4 text-base rounded-2xl",
      },
      state: {
        default: "",
        error: "border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400",
        success: "border-green-500 focus:border-green-500 focus:ring-green-500/20 dark:border-green-400",
        warning: "border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20 dark:border-yellow-400",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
  },
)

function Input({ 
  className, 
  type, 
  variant,
  size,
  state,
  ...props 
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, size, state }), className)}
      {...props}
    />
  )
}

// Floating Label Input
function FloatingInput({ 
  label,
  className,
  variant = "default",
  size = "default",
  state,
  ...props 
}) {
  const [focused, setFocused] = React.useState(false)
  const [hasValue, setHasValue] = React.useState(false)

  return (
    <div className="relative">
      <Input
        className={cn(
          "peer placeholder-transparent",
          variant === 'glass' && "placeholder:text-white/50",
          variant === 'neon' && "placeholder:text-cyan-300/50",
          className
        )}
        variant={variant}
        size={size}
        state={state}
        onFocus={(e) => {
          setFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          setHasValue(e.target.value !== '')
          props.onBlur?.(e)
        }}
        placeholder={label}
        {...props}
      />
      <label
        className={cn(
          "absolute left-4 transition-all duration-200 pointer-events-none",
          "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base",
          "peer-focus:top-2 peer-focus:text-xs peer-focus:-translate-y-0",
          "peer-focus:text-blue-500 dark:peer-focus:text-blue-400",
          hasValue && "top-2 text-xs -translate-y-0",
          
          // Variant-specific label styling
          variant === 'underlined' && "left-2",
          variant === 'glass' && "text-white/70 peer-focus:text-white",
          variant === 'neon' && "text-cyan-300 peer-focus:text-cyan-400",
          variant === 'gradient' && "peer-focus:text-purple-500 dark:peer-focus:text-purple-400",
          
          // Size adjustments
          size === 'sm' && "peer-placeholder-shown:text-sm peer-focus:text-xs",
          size === 'lg' && "peer-placeholder-shown:text-lg peer-focus:text-sm left-5",
          
          // State colors
          state === 'error' && "peer-focus:text-red-500 dark:peer-focus:text-red-400",
          state === 'success' && "peer-focus:text-green-500 dark:peer-focus:text-green-400",
          state === 'warning' && "peer-focus:text-yellow-500 dark:peer-focus:text-yellow-400",
        )}
      >
        {label}
      </label>
    </div>
  )
}

// Password Input with Toggle
function PasswordInput({ 
  className,
  variant = "default",
  size = "default",
  state,
  ...props 
}) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pr-12", className)}
        variant={variant}
        size={size}
        state={state}
        {...props}
      />
      <button
        type="button"
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-200",
          variant === 'neon' && "text-cyan-300 hover:text-cyan-200",
        )}
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <EyeOffIcon className="size-4" />
        ) : (
          <EyeIcon className="size-4" />
        )}
      </button>
    </div>
  )
}

// Search Input
function SearchInput({ 
  className,
  variant = "default",
  size = "default",
  state,
  onClear,
  value,
  ...props 
}) {
  return (
    <div className="relative">
      <SearchIcon className={cn(
        "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500",
        variant === 'neon' && "text-cyan-300",
        size === 'sm' && "size-3",
        size === 'lg' && "size-5 left-4",
      )} />
      <Input
        className={cn(
          "pl-10", 
          value && onClear && "pr-10",
          size === 'sm' && "pl-8",
          size === 'lg' && "pl-12",
          className
        )}
        variant={variant}
        size={size}
        state={state}
        value={value}
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800",
            variant === 'neon' && "text-cyan-300 hover:text-cyan-200",
          )}
          onClick={onClear}
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  )
}

// Input with validation states
function ValidatedInput({ 
  className,
  variant = "default",
  size = "default",
  state,
  showValidation = true,
  ...props 
}) {
  return (
    <div className="relative">
      <Input
        className={cn(showValidation && state !== 'default' && "pr-10", className)}
        variant={variant}
        size={size}
        state={state}
        {...props}
      />
      {showValidation && state === 'success' && (
        <CheckIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-green-500" />
      )}
      {showValidation && state === 'error' && (
        <XIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-red-500" />
      )}
    </div>
  )
}

// Animated Input Group
function InputGroup({ children, className }) {
  return (
    <div className={cn("space-y-6", className)}>
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className="animate-slideUp opacity-0"
          style={{
            animationDelay: `${index * 100}ms`,
            animationFillMode: 'forwards'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

export { 
  Input,
  FloatingInput,
  PasswordInput, 
  SearchInput,
  ValidatedInput,
  InputGroup,
}