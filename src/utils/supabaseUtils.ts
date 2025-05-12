
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility function for making queries to tables not defined in the Supabase types
 * @param tableName The name of the table to query
 */
export const queryCustomTable = (tableName: string) => {
  // We need to cast to any because the Supabase types don't include all possible tables
  // This is a more explicit type assertion to avoid TypeScript errors
  return supabase.from(tableName as any) as unknown as ReturnType<typeof supabase.from>;
};

/**
 * Check if a field exists in a table
 * This is useful for dealing with tables that might not be fully defined in types
 * @param obj The object to check
 * @param field The field to check for
 */
export const hasField = <T>(obj: T, field: string): boolean => {
  return obj !== null && obj !== undefined && Object.prototype.hasOwnProperty.call(obj, field);
};

/**
 * Format a number as Persian/Farsi currency (Rials)
 * @param amount The amount to format
 * @param showToman Whether to also show the amount in Tomans
 * @returns Formatted currency string
 */
export const formatPersianCurrency = (amount: number, showToman = true): string => {
  // Round up any decimal values (coefficient 0.1 and above)
  const roundedAmount = Math.ceil(amount);
  
  // Format with thousand separators
  const formattedRials = roundedAmount.toLocaleString('fa-IR');
  
  if (!showToman) {
    return `${formattedRials} ریال`;
  }
  
  // Calculate tomans (1 toman = 10 rials)
  const tomans = Math.floor(roundedAmount / 10);
  const formattedTomans = tomans.toLocaleString('fa-IR');
  
  return `${formattedRials} ریال (${formattedTomans} تومان)`;
};

/**
 * Convert a number to Persian/Farsi words (in Tomans)
 * @param num The number to convert to words
 * @returns The number in Persian/Farsi words
 */
export const numberToPersianWords = (num: number): string => {
  // Convert to tomans
  const tomans = Math.floor(num / 10);
  
  if (tomans === 0) return 'صفر تومان';
  
  const units = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
  const teens = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
  const tens = ['', 'ده', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
  const hundreds = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
  const scales = ['', 'هزار', 'میلیون', 'میلیارد', 'بیلیون', 'بیلیارد', 'تریلیون'];
  
  if (tomans === 0) return 'صفر تومان';
  
  let words = '';
  let scaleIndex = 0;
  let n = tomans;
  
  while (n > 0) {
    const chunk = n % 1000;
    
    if (chunk !== 0) {
      let chunkWords = '';
      
      const hundred = Math.floor(chunk / 100);
      let remainder = chunk % 100;
      
      if (hundred > 0) {
        chunkWords += hundreds[hundred] + ' ';
      }
      
      if (remainder > 0) {
        if (remainder < 10) {
          chunkWords += units[remainder] + ' ';
        } else if (remainder < 20) {
          chunkWords += teens[remainder - 10] + ' ';
        } else {
          const ten = Math.floor(remainder / 10);
          const unit = remainder % 10;
          chunkWords += tens[ten] + ' ';
          if (unit > 0) {
            chunkWords += 'و ' + units[unit] + ' ';
          }
        }
      }
      
      if (scaleIndex > 0) {
        chunkWords += scales[scaleIndex] + ' ';
      }
      
      words = chunkWords + (words ? 'و ' + words : '');
    }
    
    n = Math.floor(n / 1000);
    scaleIndex++;
  }
  
  return words.trim() + ' تومان';
};
