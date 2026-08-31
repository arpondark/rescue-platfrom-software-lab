export type Role = "ROLE_SUPER_ADMIN" | "ROLE_NGO_ADMIN" | "ROLE_VOLUNTEER";
export type NgoStatus = "PENDING" | "APPROVED" | "REJECTED";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type VolunteerStatus = "PENDING_VERIFICATION" | "ACTIVE" | "INACTIVE";
export type EventType = "FLOOD" | "CYCLONE" | "EARTHQUAKE" | "FIRE" | "PANDEMIC" | "OTHER";
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type EventStatus = "DRAFT" | "OPEN" | "ONGOING" | "CLOSED" | "CANCELLED";
export type InvitationStatus = "INVITED" | "ACCEPTED" | "DECLINED" | "DEPLOYED";

export interface Location { id: number; name: string; bnName?: string; parentId?: number | null; }

export interface PageResp<T> {
  content: T[];
  page: number; size: number; totalElements: number; totalPages: number;
  hasNext: boolean; hasPrevious: boolean;
}

export interface UserPrincipal {
  id: number; email: string; name: string; role: Role;
  ngoId?: number | null; ngoStatus?: string | null;
}

export interface AuthResponse {
  accessToken: string | null;
  refreshToken: string | null;
  expiresInMs: number;
  principal: UserPrincipal;
}

export interface NgoResponse {
  id: number; name: string; email: string; registrationNo: string;
  logoUrl?: string; phone: string; website?: string;
  division?: Location; district?: Location; thana?: Location;
  status: NgoStatus; rejectionReason?: string; approvedAt?: string; createdAt?: string;
}

export interface VolunteerResponse {
  id: number; name: string; email: string; phone: string; nid?: string;
  dateOfBirth?: string; gender: Gender;
  division?: Location; district?: Location; thana?: Location;
  skills: string[]; status: VolunteerStatus;
}

export interface DisasterEventResponse {
  id: number; title: string; type: EventType; severity: Severity; description?: string;
  divisions: Location[]; districts: Location[]; thanas: Location[];
  startAt: string; endAt: string; requiredVolunteers: number;
  status: EventStatus; ngoId: number; ngoName: string;
  acceptedCount: number; invitedCount: number; declinedCount: number; deployedCount: number;
  createdAt?: string;
}

export interface InvitationResponse {
  id: number; eventId: number; eventTitle: string;
  volunteerId: number; volunteerName: string;
  ngoId: number; ngoName: string;
  status: InvitationStatus; invitedAt?: string; respondedAt?: string;
}

export interface BulkUploadResponse {
  batchId: number; totalRows: number; successCount: number; failedCount: number;
  errors: { rowNumber: number; error: string }[];
}