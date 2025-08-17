import { applyDecorators, Delete, Get, HttpCode, HttpStatus, Patch, Post, Put } from "@nestjs/common";
import { PrivilegePolicy } from "@Package/auth/decorators/privilege.decorator";

interface PrivilegeDecoratorOptions {
  apiUrl: string;
  privilegeKeys: [string, ...string[]];
  policyAccessMode?: string[];
}

const createPrivilegeDecorator = (
  httpMethod: Function,
  statusCode: HttpStatus,
  options: PrivilegeDecoratorOptions
) => {
  const { apiUrl, privilegeKeys, policyAccessMode = [] } = options;
  
  const decorators = [
    PrivilegePolicy({ privilegeKeys, ...(policyAccessMode.length ? { policyAccessMode } : {}) }),
    httpMethod(apiUrl),
    HttpCode(statusCode)
  ];

  return applyDecorators(...decorators);
};

export const GetPrivilege = (options: PrivilegeDecoratorOptions) =>
  createPrivilegeDecorator(Get, HttpStatus.OK, options);

export const PostPrivilege = (options: PrivilegeDecoratorOptions) =>
  createPrivilegeDecorator(Post, HttpStatus.CREATED, options);

export const PutPrivilege = (options: PrivilegeDecoratorOptions) =>
  createPrivilegeDecorator(Put, HttpStatus.OK, options);

export const DeletePrivilege = (options: PrivilegeDecoratorOptions) =>
  createPrivilegeDecorator(Delete, HttpStatus.OK, options);

export const PatchPrivilege = (options: PrivilegeDecoratorOptions) =>
  createPrivilegeDecorator(Patch, HttpStatus.OK, options);
  
  