import { useState } from "react"
import { Lock, Eye, EyeOff, Key, RefreshCw } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { EncryptionService } from "../lib/encryption"
import { cn } from "../lib/utils"

export function PasswordDialog({ isOpen, onClose, onConfirm, mode, title, description }) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const isEncryptMode = mode === "encrypt"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!password) {
      setError("Password is required")
      return
    }

    if (isEncryptMode) {
      if (password !== confirmPassword) {
        setError("Passwords do not match")
        return
      }

      const validation = EncryptionService.validatePassword(password)
      if (!validation.isValid) {
        setError(validation.message)
        return
      }
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate processing
      onConfirm(password)
      handleClose()
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setPassword("")
    setConfirmPassword("")
    setError("")
    setShowPassword(false)
    onClose()
  }

  const generatePassword = () => {
    const generated = EncryptionService.generatePassword()
    setPassword(generated)
    setConfirmPassword(generated)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-strong border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            {title || (isEncryptMode ? "Encrypt Note" : "Decrypt Note")}
          </DialogTitle>
          <DialogDescription>
            {description ||
              (isEncryptMode
                ? "Set a password to encrypt and protect this note"
                : "Enter the password to decrypt this note")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="glass neumorphic-inset pr-10"
                autoFocus
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Confirm Password (Encrypt mode only) */}
          {isEncryptMode && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <Input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="glass neumorphic-inset"
              />
            </div>
          )}

          {/* Generate Password Button (Encrypt mode only) */}
          {isEncryptMode && (
            <Button
              type="button"
              variant="outline"
              onClick={generatePassword}
              className="w-full glass hover:bg-primary/20 bg-transparent"
            >
              <Key className="h-4 w-4 mr-2" />
              Generate Secure Password
            </Button>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/20 border border-destructive/30 animate-fade-in">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Password Strength Indicator (Encrypt mode only) */}
          {isEncryptMode && password && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Password Strength</span>
                <span
                  className={cn(
                    "font-medium",
                    EncryptionService.validatePassword(password).isValid ? "text-green-400" : "text-yellow-400",
                  )}
                >
                  {EncryptionService.validatePassword(password).isValid ? "Strong" : "Weak"}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    EncryptionService.validatePassword(password).isValid
                      ? "w-full bg-green-400"
                      : password.length > 4
                        ? "w-2/3 bg-yellow-400"
                        : "w-1/3 bg-red-400",
                  )}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1 glass bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              {isEncryptMode ? "Encrypt" : "Decrypt"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
