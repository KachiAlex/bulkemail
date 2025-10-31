export type Role = 'admin' | 'user' | 'manager' | string;

export interface AppUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
}

export function isAdmin(user?: AppUser | null): boolean {
  return !!user && (user.role === 'admin');
}

export function hasRole(user: AppUser | null | undefined, roles: Role[]): boolean {
  if (!user || !user.role) return false;
  return roles.includes(user.role);
}


