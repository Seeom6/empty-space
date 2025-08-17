
export class GetByCriteriaAccountResponse {
  id: string;
  email: string;
  isActive: boolean;
  type: string;
  image: string;
  phoneNumber: string;
  role: {
    name: string;
    id: string;
  };
  accountId: string;
  fullName: string;
  createdAt: Date;
  constructor({ account, languageKey }: { account: any; languageKey: string }) {

    this.id = account._id;
    this.email = account.email;
    this.isActive = account.isActive;
    this.type = account.type;
    this.phoneNumber = account.phoneNumber;
    this.createdAt = account.createdAt;
    const accountMoreData = account;
    this.accountId = accountMoreData._id;
    this.fullName = accountMoreData.fullName;

    this.fullName = accountMoreData.fullName;

  }

  toObject(): {
    id: string;
    email: string;
    isActive: boolean;
    type: string;
    image: string;
    phoneNumber: string;
    role: {
      name: string;
      id: string;
    };
    accountId: string;
    fullName: string;
    createdAt: Date;
  } {
    return {
      id: this.id,
      email: this.email,
      isActive: this.isActive,
      type: this.type,
      accountId: this.accountId,
      image: this.image,
      role: this.role,
      fullName: this.fullName,
      phoneNumber: this.phoneNumber,
      createdAt: this.createdAt,
    };
  }
}
