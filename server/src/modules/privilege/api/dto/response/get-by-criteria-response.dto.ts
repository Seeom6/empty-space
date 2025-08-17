import { LocalizationService } from '@Package/services';
import { PrivilegeDocument } from '../../../data/privilege.schema';

export class GetByCriteriaResponse {
  name: string;
  privileges: {
    id: string;
    action: string;
    description: string;
    checked: boolean;
  }[];
  localizationService: LocalizationService;

  constructor({
    privilegesGroup,
    languageKey,
  }: {
    privilegesGroup: PrivilegeDocument[];
    languageKey: string;
  }) {
    this.name = this.localizationService.string({
      obj: privilegesGroup[0].builtInRoleName,
      languageKey,
    });
    this.privileges = privilegesGroup.map((privilege: any, index) => {
      return {
        id: privilege._id,
        action: this.localizationService.string({
          obj: privilege.privilegeActionName,
          languageKey,
        }),
        description: this.localizationService.string({
          obj: privilege.description,
          languageKey,
        }),
        checked: false,
      };
    });
  }

  toObject(): {
    name: string;
    privileges: {
      id: string;
      action: string;
      description: string;
      checked: boolean;
    }[];
  } {
    return {
      name: this.name,
      privileges: this.privileges,
    };
  }
}
