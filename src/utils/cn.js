/** Tailwind utility to join conditional class names. */
export const cn = (...values) =>
  values
    .flat(Infinity)
    .filter((value) => typeof value === 'string' && value.trim() !== '')
    .join(' ')

export default cn
