
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility function for making queries to tables not defined in the Supabase types
 * @param tableName The name of the table to query
 */
export const queryCustomTable = (tableName: string) => {
  // Using 'any' here is necessary because we're working with tables that aren't in the type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return supabase.from(tableName) as any;
};
