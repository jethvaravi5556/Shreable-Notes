// Simple encryption utilities for note protection
// Note: In production, use more robust encryption libraries

export class EncryptionService {
  static encoder = new TextEncoder()
  static decoder = new TextDecoder()

  // Generate a key from password using PBKDF2
  static async deriveKey(password, salt) {
    const keyMaterial = await crypto.subtle.importKey("raw", this.encoder.encode(password), "PBKDF2", false, [
      "deriveBits",
      "deriveKey",
    ])

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    )
  }

  // Encrypt text with password
  static async encrypt(text, password) {
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16))
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const key = await this.deriveKey(password, salt)

      const encrypted = await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        key,
        this.encoder.encode(text),
      )

      // Combine salt, iv, and encrypted data
      const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
      combined.set(salt, 0)
      combined.set(iv, salt.length)
      combined.set(new Uint8Array(encrypted), salt.length + iv.length)

      // Convert to base64 for storage
      return btoa(String.fromCharCode(...combined))
    } catch (error) {
      console.error("Encryption failed:", error)
      throw new Error("Failed to encrypt content")
    }
  }

  // Decrypt text with password
  static async decrypt(encryptedData, password) {
    try {
      // Convert from base64
      const combined = new Uint8Array(
        atob(encryptedData)
          .split("")
          .map((char) => char.charCodeAt(0)),
      )

      // Extract salt, iv, and encrypted data
      const salt = combined.slice(0, 16)
      const iv = combined.slice(16, 28)
      const encrypted = combined.slice(28)

      const key = await this.deriveKey(password, salt)

      const decrypted = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        key,
        encrypted,
      )

      return this.decoder.decode(decrypted)
    } catch (error) {
      console.error("Decryption failed:", error)
      throw new Error("Failed to decrypt content - incorrect password?")
    }
  }

  // Validate password strength
  static validatePassword(password) {
    if (password.length < 8) {
      return { isValid: false, message: "Password must be at least 8 characters long" }
    }

    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: "Password must contain at least one uppercase letter" }
    }

    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: "Password must contain at least one lowercase letter" }
    }

    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: "Password must contain at least one number" }
    }

    return { isValid: true, message: "Password is strong" }
  }

  // Generate a secure random password
  static generatePassword(length = 16) {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      password += charset[randomIndex]
    }

    return password
  }
}
