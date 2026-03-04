export interface TemporaryUser {
    id: string;
    email: string;
    name: string;
    expiresAt: number; // Timestamp in milliseconds
    deviceId?: string; // Optional device identifier
}

export interface LoginCredentials {
    email: string;
    password: string;
    isTemporary?: boolean;
}