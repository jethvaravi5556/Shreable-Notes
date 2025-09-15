import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cva } from 'class-variance-authority'
import { XIcon, ChevronDownIcon } from 'lucide-react'

import { cn } from '../../lib/utils'

function Popover({
  ...props
}) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  className,
  ...props
}) {
  return (
    <PopoverPrimitive.Trigger 
      data-slot="popover-trigger"
      className={cn(
        // Enhanced trigger styling
        "inline-flex items-center justify-center gap-2",
        "transition-all duration-200 ease-out",
        "data-[state=open]:scale-[0.98] data-[state=open]:brightness-95",
        className
      )}
      {...props} 
    />
  )
}

const popoverVariants = cva(
  "z-50 origin-[--radix-popover-content-transform-origin] outline-none focus:outline-none",
  {
    variants: {
      variant: {
        default: 
          "bg-white/95 backdrop-blur-xl border border-gray-200/50 text-gray-900 shadow-xl shadow-gray-900/10 dark:bg-gray-900/95 dark:border-gray-700/50 dark:text-gray-100 dark:shadow-black/20",
        
        glass:
          "bg-white/20 backdrop-blur-2xl border border-white/30 text-gray-900 shadow-2xl ring-1 ring-white/20 dark:bg-gray-900/20 dark:border-gray-700/30 dark:text-gray-100",
        
        premium:
          "bg-gradient-to-br from-white/90 via-white/95 to-gray-50/90 backdrop-blur-xl border border-purple-200/50 text-gray-900 shadow-2xl ring-1 ring-purple-200/30 dark:from-gray-900/90 dark:via-gray-900/95 dark:to-gray-800/90 dark:border-purple-700/30 dark:text-gray-100",
        
        vibrant:
          "bg-gradient-to-br from-purple-50/90 via-blue-50/90 to-indigo-50/90 backdrop-blur-xl border border-purple-200/60 text-purple-900 shadow-2xl ring-1 ring-purple-200/40 dark:from-purple-900/30 dark:via-blue-900/30 dark:to-indigo-900/30 dark:border-purple-500/30 dark:text-purple-100",
        
        minimal:
          "bg-white border border-gray-100 text-gray-900 shadow-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
        
        neon:
          "bg-cyan-950/80 backdrop-blur-xl border-2 border-cyan-400/50 text-cyan-100 shadow-2xl shadow-cyan-400/20 ring-1 ring-cyan-400/20",
      },
      size: {
        sm: "w-56 p-3 rounded-xl text-sm",
        default: "w-72 p-4 rounded-2xl",
        lg: "w-80 p-6 rounded-2xl",
        xl: "w-96 p-8 rounded-3xl",
        auto: "min-w-48 max-w-sm p-4 rounded-2xl",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 8,
  variant,
  size,
  showArrow = true,
  children,
  ...props
}) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          popoverVariants({ variant, size }),
          
          // Smooth animations - no jarring effects
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          'data-[state=open]:duration-300 data-[state=open]:ease-out',
          
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          'data-[state=closed]:duration-200 data-[state=closed]:ease-in',
          
          // Directional slide animations
          'data-[side=bottom]:slide-in-from-top-3 data-[side=left]:slide-in-from-right-3',
          'data-[side=right]:slide-in-from-left-3 data-[side=top]:slide-in-from-bottom-3',
          
          // Hardware acceleration for smooth performance
          'transform-gpu will-change-transform',
          
          className,
        )}
        {...props}
      >
        {/* Content wrapper with staggered animations */}
        <div className="relative">
          <div className="animate-in fade-in-0 slide-in-from-top-1 duration-300 delay-75">
            {children}
          </div>
          
          {/* Decorative elements for special variants */}
          {variant === 'premium' && (
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10 rounded-3xl blur-xl -z-10" />
          )}
          
          {variant === 'vibrant' && (
            <>
              <div className="absolute top-2 left-2 size-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse" />
              <div className="absolute bottom-2 right-2 size-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-ping" />
            </>
          )}
          
          {variant === 'neon' && (
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-cyan-500/5 rounded-inherit animate-pulse" />
          )}
        </div>
        
        {/* Enhanced Arrow */}
        {showArrow && (
          <PopoverPrimitive.Arrow 
            className={cn(
              "fill-current",
              variant === 'glass' && "fill-white/20 drop-shadow-sm",
              variant === 'premium' && "fill-white/90 drop-shadow-md",
              variant === 'vibrant' && "fill-purple-100/90 drop-shadow-md",
              variant === 'neon' && "fill-cyan-950/80 drop-shadow-glow",
              variant === 'minimal' && "fill-white dark:fill-gray-800",
              !variant && "fill-white/95 dark:fill-gray-900/95 drop-shadow-sm"
            )}
            width={16}
            height={8}
          />
        )}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
  ...props
}) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

// Enhanced popover components

function PopoverHeader({ className, children, ...props }) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between pb-3 border-b border-gray-200/50 dark:border-gray-700/50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function PopoverTitle({ className, ...props }) {
  return (
    <h3 
      className={cn(
        "font-semibold text-base leading-none",
        className
      )}
      {...props} 
    />
  )
}

function PopoverDescription({ className, ...props }) {
  return (
    <p 
      className={cn(
        "text-sm text-gray-600 dark:text-gray-400 leading-relaxed",
        className
      )}
      {...props} 
    />
  )
}

function PopoverBody({ className, children, ...props }) {
  return (
    <div 
      className={cn("py-3", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function PopoverFooter({ className, ...props }) {
  return (
    <div 
      className={cn(
        "flex items-center justify-end gap-2 pt-3 border-t border-gray-200/50 dark:border-gray-700/50",
        className
      )}
      {...props} 
    />
  )
}

function PopoverClose({ className, ...props }) {
  return (
    <PopoverPrimitive.Close
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded-full opacity-70 hover:opacity-100 transition-opacity",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        className
      )}
      {...props}
    >
      <XIcon className="h-3 w-3" />
      <span className="sr-only">Close</span>
    </PopoverPrimitive.Close>
  )
}

// Dropdown-style popover
function PopoverDropdown({ 
  trigger, 
  children, 
  variant = "default",
  size = "default",
  ...props 
}) {
  return (
    <Popover {...props}>
      <PopoverTrigger className="inline-flex items-center gap-1">
        {trigger}
        <ChevronDownIcon className="h-4 w-4 transition-transform ui-open:rotate-180" />
      </PopoverTrigger>
      <PopoverContent variant={variant} size={size}>
        {children}
      </PopoverContent>
    </Popover>
  )
}

// Tooltip-style popover
function PopoverTooltip({ 
  content, 
  children, 
  variant = "minimal",
  size = "sm",
  ...props 
}) {
  return (
    <Popover {...props}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent variant={variant} size={size} showArrow={true}>
        <div className="text-sm">{content}</div>
      </PopoverContent>
    </Popover>
  )
}

export { 
  Popover, 
  PopoverTrigger, 
  PopoverContent, 
  PopoverAnchor,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverBody,
  PopoverFooter,
  PopoverClose,
  PopoverDropdown,
  PopoverTooltip,
}