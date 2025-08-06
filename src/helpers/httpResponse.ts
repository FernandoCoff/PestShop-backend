export const ok = <T extends object>(body: T | T[]) => {
  return {
    success: true,
    status: 200,
    body: body
  }
}
export const notFound = (message : string) => {
  return {
    success: false,
    status: 400,
    body: {message}
  }
}
export const serverError = (message : string) => {
  return {
    success: false,
    status: 409,
    body: {message}
  }
}
