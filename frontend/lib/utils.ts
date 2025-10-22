import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility fonksiyonu: Tailwind CSS sınıflarını birleştirir
 * 
 * clsx ile koşullu sınıfları birleştirir ve tailwind-merge ile çakışan sınıfları çözer
 * 
 * @param inputs - Birleştirilecek CSS sınıfları
 * @returns Birleştirilmiş CSS sınıfı string'i
 * 
 * @example
 * cn("px-2 py-1", "px-4") // "py-1 px-4"
 * cn("bg-red-500", { "bg-blue-500": isActive }) // "bg-blue-500" veya "bg-red-500"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
