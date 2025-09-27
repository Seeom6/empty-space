export interface InviteCode {
  id: string;
  code: string;
  department: string;
  role: string;
  permissions: string[];
  status: string;
  usedBy?: string;
  usedByEmail?: string;
  createdAt: string;
  createdBy: string;
  expiresAt: string;
  usedAt?: string;
}
