export const parseError = (error: any): string => {
  try {
    if (error.response?.data) {
      const errorData = error.response.data
      if (errorData.error?.details?.errors) {
        const errors = errorData.error.details.errors
        if (Array.isArray(errors)) {
          const messages = errors.map((single) => {
            if (single.message) {
              return `${single?.message}`
            }
            return `${single.join(' ')}`
          })
          return messages.join(' ')
        }
        const messages = Object.keys(errors).map((key) => {
          return `${errors[key].join(' ')}`
        })
        return messages.join(' ')
      }
      return errorData.error?.message || 'An unknown error occurred'
    }
    return error.message || 'An unknown error occurred'
  } catch (err) {
    return 'An unknown error occurred'
  }
}
