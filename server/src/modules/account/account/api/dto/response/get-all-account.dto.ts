export class GetAllUser {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    city: string;
    createdAt: Date;
    allBookingCount: number;
    lastBooking: Date;
    isActive: boolean;
    constructor(account: any & { user: any }) {
        this.id = account._id?.toString() ?? null;
        this.fullName = account.user?.fullName ?? null;
        this.email = account.email ?? null;
        this.phoneNumber = account.phoneNumber ?? null;
        this.city = account.user?.city ?? null;
        this.createdAt = account["createdAt"] ?? null;
        this.allBookingCount = account["bookingCount"] ?? null;
        this.lastBooking = account["lastBooking"] ?? null;
        this.isActive = account.isActive
    }
}