export class CreateUserDto {
  username: string;
  password: string;
  tenantId: string;
  roleid?: number | null;
  admin?: boolean;
}
