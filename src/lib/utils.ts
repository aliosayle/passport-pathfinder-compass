import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInDays } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Determines color based on passport expiry date
export function getExpiryStatusColor(expiryDate: Date): string {
  const today = new Date()
  const daysToExpiry = differenceInDays(expiryDate, today)
  
  if (daysToExpiry < 0) {
    return "red-500" // Expired
  } else if (daysToExpiry <= 30) {
    return "orange-500" // Expiring soon (within 30 days)
  } else if (daysToExpiry <= 90) {
    return "yellow-500" // Approaching expiry (within 90 days)
  } else {
    return "green-500" // Valid with plenty of time
  }
}
