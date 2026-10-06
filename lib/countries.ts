// Countries offers can be located in. Germany is the default everywhere (search, marketplace, new offers).
export const COUNTRIES = [
  { code: 'DE', name: 'Deutschland' },
  { code: 'AT', name: 'Österreich' },
  { code: 'CH', name: 'Schweiz' },
  { code: 'NL', name: 'Niederlande' },
  { code: 'FR', name: 'Frankreich' },
  { code: 'IT', name: 'Italien' },
  { code: 'ES', name: 'Spanien' },
  { code: 'PT', name: 'Portugal' },
  { code: 'PL', name: 'Polen' },
  { code: 'DK', name: 'Dänemark' },
  { code: 'SE', name: 'Schweden' },
  { code: 'NO', name: 'Norwegen' },
] as const

export type CountryCode = (typeof COUNTRIES)[number]['code']

export const DEFAULT_COUNTRY: CountryCode = 'DE'

export function isCountryCode(v: unknown): v is CountryCode {
  return COUNTRIES.some((c) => c.code === v)
}

export function countryName(code: string | null | undefined): string {
  return COUNTRIES.find((c) => c.code === code)?.name ?? 'Deutschland'
}
