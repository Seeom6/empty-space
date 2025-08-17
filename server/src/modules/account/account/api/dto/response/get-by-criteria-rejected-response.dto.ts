

export class GetByCriteriaRejectedAccountResponse {
  id: string;
  email: string;
  type: string;
  phoneNumber: string;
  fullName: string;
  availableTime: string;
  idImage: string;
  createdAt: Date;
  specialty: {
    id: string;
    name: string;
  }[];

  university: {
    id: string;
    name: string;
  };
  constructor({ account, languageKey }: { account: any; languageKey: string }) {

    this.id = account._id;
    this.email = account.email;
    this.type = account.type;
    this.phoneNumber = account.phoneNumber;
    this.createdAt = account.createdAt;
    this.fullName = account.fullName;
  }

  toObject(): {
    id: string;
    email: string;
    type: string;
    phoneNumber: string;
    fullName: string;
    availableTime: string;
    idImage: string;
    createdAt: Date;
    specialty: {
      id: string;
      name: string;
    }[];
    university: {
      id: string;
      name: string;
    };
  } {
    return {
      id: this.id,
      email: this.email,
      type: this.type,
      fullName: this.fullName,
      phoneNumber: this.phoneNumber,
      availableTime: this.availableTime,
      idImage: this.idImage,
      specialty: this.specialty,
      createdAt: this.createdAt,
      university: this.university,
    };
  }
}
