import { PanelPermissions } from "../roles.actions";

export class CreateRoleDto {
  name: string;
  permissions: PanelPermissions[];
}

export class UpdateRoleDto {
  id: number;
  permissions: PanelPermissions[];
}
