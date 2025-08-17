import {applyDecorators, Delete, Get, Patch, Post, Put} from "@nestjs/common";
import { AllowRole } from "@Package/api";
import { AccountRole } from "seeders/dist/schemas/account.shcema";

export function PostPolicy(options: { path: string; role: AccountRole[]}){
  return applyDecorators(
    Post(options.path),
    AllowRole(...options.role)
  )
}

export function GetPolicy(options: { path: string; role: AccountRole[]}){
  return applyDecorators(
    Get(options.path),
    AllowRole(...options.role)
  )
}

export function DeletePolicy(options: { path: string; role: AccountRole[]}){
  return applyDecorators(
    Delete(options.path),
    AllowRole(...options.role)
  )
}


export function PutPolicy(options: { path: string; role: AccountRole[]}){
  return applyDecorators(
    Put(options.path),
    AllowRole(...options.role)
  )
}

export function PatchPolicy(options: { path: string; role: AccountRole[]}){
  return applyDecorators(
    Patch(options.path),
    AllowRole(...options.role)
  )
}




