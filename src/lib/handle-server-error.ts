import { toast } from 'sonner'
import { parseError } from './parse-error'

export function handleServerError(error: unknown) {
  // eslint-disable-next-line no-console
  console.log(error)

  const errMsg = parseError(error)

  toast(errMsg)
}
