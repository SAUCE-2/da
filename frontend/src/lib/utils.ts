import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sortByName<T>(items: T[], getName: (item: T) => string) {
  return [...items].sort((left, right) =>
    getName(left).localeCompare(getName(right)),
  )
}

export function pluralize(
  count: number,
  singular: string,
  plural?: string,
) {
  if (count === 1) {
    return singular
  }

  return plural ?? toDefaultPlural(singular)
}

function toDefaultPlural(word: string) {
  if (
    word.endsWith('y') &&
    word.length > 1 &&
    !isVowel(word.at(-2) ?? '')
  ) {
    return `${word.slice(0, -1)}ies`
  }

  return `${word}s`
}

function isVowel(char: string) {
  return 'aeiou'.includes(char.toLowerCase())
}
