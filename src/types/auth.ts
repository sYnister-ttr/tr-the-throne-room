
import { User, Session } from "@supabase/supabase-js";

export type UserRole = "admin" | "moderator" | "user";

export interface UserWithRole extends User {
  role?: UserRole;
}

export interface AuthContextType {
  user: UserWithRole | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isModerator: boolean;
  refreshUserRole: () => Promise<void>;
}
