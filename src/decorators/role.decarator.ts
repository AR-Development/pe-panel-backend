import { SetMetadata } from "@nestjs/common";
import { PanelPermissions } from "src/modules/roles/roles.actions";

export const Roles = (...roles: PanelPermissions[]) =>
  SetMetadata("roles", roles);
