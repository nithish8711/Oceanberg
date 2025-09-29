export type SafeRoute = {
  id: string
  name: string
  // When present, safePlace includes coordinates and a human-readable label
  safePlace: { lat: number; lng: number; label: string } | null
  // Optional fields that may exist from the API but aren't required by the page
  path?: unknown
  highlighted?: boolean
}
