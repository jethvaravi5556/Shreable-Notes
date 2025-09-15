import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'

import { cn } from '../../lib/utils'

function Dialog({
  ...props
}) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        // Smooth overlay animations - no blinking
        'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-300',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-200',
        // Prevent flash of content
        'data-[state=closed]:pointer-events-none',
        className,
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    // Ensure smooth mounting without flicker
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          // Base styles for smooth rendering
          'fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%]',
          'gap-4 rounded-2xl border border-white/20 bg-white/95 backdrop-blur-xl p-6 shadow-2xl sm:max-w-lg',
          'dark:bg-gray-900/95 dark:border-gray-700/50',
          
          // Smooth entrance animations - no jarring effects
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          'data-[state=open]:duration-300 data-[state=open]:ease-out',
          
          // Smooth exit animations
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
          'data-[state=closed]:duration-200 data-[state=closed]:ease-in',
          
          // Prevent layout shifts
          'transform-gpu will-change-transform',
          
          // Focus management
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
          
          className,
        )}
        // Prevent initial flash
        style={{
          opacity: 1,
          transform: 'translate(-50%, -50%) scale(1)',
        }}
        {...props}
      >
        <div className="relative">
          {children}
          
          {showCloseButton && (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              className={cn(
                // Enhanced close button - smooth interactions
                'absolute top-0 right-0 -mt-2 -mr-2',
                'inline-flex h-8 w-8 items-center justify-center rounded-full',
                'bg-white/90 backdrop-blur-sm border border-gray-200/50',
                'text-gray-500 hover:text-gray-700 hover:bg-white',
                'dark:bg-gray-800/90 dark:border-gray-700/50',
                'dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700',
                
                // Smooth transitions
                'transition-all duration-200 ease-out',
                'hover:scale-110 active:scale-95',
                'hover:shadow-lg hover:shadow-black/10',
                
                // Focus states
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2',
                
                // Prevent selection
                'select-none touch-manipulation',
              )}
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </div>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        'flex flex-col space-y-2 text-center sm:text-left',
        // Smooth content loading
        'animate-in fade-in-0 slide-in-from-top-2 duration-300 delay-75',
        className
      )}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-3 sm:flex-row sm:justify-end',
        // Smooth content loading
        'animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-100',
        className,
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        'text-xl font-semibold leading-tight tracking-tight text-gray-900 dark:text-gray-100',
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        'text-sm text-gray-600 dark:text-gray-400 leading-relaxed',
        className
      )}
      {...props}
    />
  )
}

// Enhanced Dialog with no blinking
function SmoothDialog({ children, ...props }) {
  return (
    <Dialog {...props}>
      {children}
    </Dialog>
  )
}

// Pre-configured smooth dialog variants
function QuickDialog({ title, description, children, ...props }) {
  return (
    <SmoothDialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </SmoothDialog>
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  SmoothDialog,
  QuickDialog,
}