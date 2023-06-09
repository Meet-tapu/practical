import { ROLE } from 'src/helpers/role.enum';

export class JwtPayloadDto {
  email: string;
  role: ROLE;
}
