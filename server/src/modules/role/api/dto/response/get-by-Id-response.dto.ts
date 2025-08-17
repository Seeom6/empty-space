import { LocalizableStringDocument, LocalizationService } from "../../../../../package";
import { RoleDocument } from "../../../data/role.schema";
import { PrivilegeDocument } from "../../../../privilege/data/privilege.schema";
import { groupBy } from "lodash";

export class GetByIdResponse {
  id: string;
  name: LocalizableStringDocument;
  privileges: {
    name: string;
    privileges: {
      id: string;
      action: string;
      description: string;
      checked: boolean;
    }[];
  }[];
  localizationService: LocalizationService;

  constructor({
    role,
    privileges,
    languageKey,
  }: {
    role: RoleDocument;
    privileges: PrivilegeDocument[];
    languageKey: string;
  }) {
    this.localizationService = new LocalizationService();
    this.id = role._id as string;
    this.name = role.name as LocalizableStringDocument;
    const privilegesKeys = role.privileges.map((privilege) => privilege.key);
    const privilegesGroups = groupBy(privileges, "builtInRoleName.en");

    this.privileges = Object.values(privilegesGroups).map(
      (privilegesGroup: PrivilegeDocument[]) => {
        return {
          name: this.localizationService.string({
            obj: privilegesGroup[0].builtInRoleName,
            languageKey,
          }),
          privileges: privilegesGroup.map((privilege: PrivilegeDocument) => {
            return {
              id: privilege._id as string,
              action: this.localizationService.string({
                obj: privilege.privilegeActionName,
                languageKey,
              }),
              description: this.localizationService.string({
                obj: privilege.description,
                languageKey,
              }),
              checked: privilegesKeys.includes(privilege.key),
            };
          }),
        };
      },
    );
  }

  toObject(): {
    id: string;
    name: LocalizableStringDocument;
    privileges: {
      name: string;
      privileges: {
        id: string;
        action: string;
        description: string;
        checked: boolean;
      }[];
    }[];
  } {
    return {
      id: this.id,
      name: this.name,
      privileges: this.privileges,
    };
  }
}
