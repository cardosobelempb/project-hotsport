/**
 * Reexecuta assertions até que todas passem ou o tempo máximo seja atingido.
 *
 * Útil para testar comportamentos assíncronos/eventuais,
 * como subscribers, side effects ou event buses.
 *
 * @param assertions Função contendo as assertions (deve lançar erro se falhar)
 * @param timeout Tempo máximo de espera em ms
 * @param interval Intervalo entre tentativas em ms
 */
export async function waitFor(
  assertions: () => void,
  timeout = 1000,
  interval = 10,
): Promise<void> {
  const startTime = Date.now()
  let lastError: unknown

  return new Promise((resolve, reject) => {
    const attempt = () => {
      try {
        assertions()
        return resolve()
      } catch (error) {
        lastError = error

        const elapsedTime = Date.now() - startTime

        if (elapsedTime >= timeout) {
          return reject(lastError)
        }

        setTimeout(attempt, interval)
      }
    }

    attempt()
  })
}
