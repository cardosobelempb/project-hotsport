import { IServiceError } from './IServiceError'

export class StrongPasswordError extends Error implements IServiceError {
  constructor(message: string, password: string) {
    super(message)
    this.name = 'StrongPasswordError'
    this.validatePasswordWithMessage(password)
  }

  private validatePasswordWithMessage(password: string): string | null {
    if (password.length < 8) {
      return 'A senha deve ter no mínimo 8 caracteres.'
    }
    if (!/[A-Z]/.test(password)) {
      return 'A senha deve conter pelo menos uma letra maiúscula.'
    }
    if (!/[a-z]/.test(password)) {
      return 'A senha deve conter pelo menos uma letra minúscula.'
    }
    if (!/[0-9]/.test(password)) {
      return 'A senha deve conter pelo menos um número.'
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'A senha deve conter pelo menos um símbolo especial.'
    }

    return null // senha válida
  }
}
