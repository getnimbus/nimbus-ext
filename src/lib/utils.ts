export const tryCatch = (fn: (...data: any[]) => any, defaultValue: any) => {
  try {
    return fn()
  } catch (error) {
    return defaultValue;
  }
}