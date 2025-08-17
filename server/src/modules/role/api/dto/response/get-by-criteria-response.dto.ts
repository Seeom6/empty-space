import { LocalizationService } from "@Package/services/localization";
import { RoleDocument } from "../../../data/role.schema";

export class GetByCriteriaResponse {
  id: string;
  name: string;
  localizationService: LocalizationService;
  buildIn: boolean;
  constructor({
    role,
    languageKey,
  }: {
    role: RoleDocument;
    languageKey: string;
  }) {
    this.buildIn = role.buildIn;
    this.localizationService = new LocalizationService();
    this.id = role._id as string;
    this.name = this.localizationService.string({
      obj: role.name,
      languageKey,
    });
  }

  toObject(): {
    id: string;
    name: string;
    buildIn: boolean;
  } {
    return {
      id: this.id,
      name: this.name,
      buildIn: this.buildIn,
    };
  }
}
