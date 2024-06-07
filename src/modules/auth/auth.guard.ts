import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { UsersService } from "src/modules/users/users.service";
import { PUBLIC_KEY, ROLES_KEY } from "./decorator/auth.decorator";
import { Role, UserDto } from "../users/dto";

@Injectable()
export class AuthenticatorGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    if (!token) {
      throw new UnauthorizedException();
    }

    let authenticatedUser: UserDto;
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_KEY,
      });

      authenticatedUser = await this.usersService.findByEmail(
        payload?.username,
      );
    } catch {
      throw new UnauthorizedException();
    }

    if (!authenticatedUser) {
      throw new UnauthorizedException();
    }

    const allowedRoles = this.reflector.getAllAndOverride<Role[] | null>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (
      allowedRoles.length > 0 &&
      !allowedRoles.some((r) => authenticatedUser.roles.includes(r))
    ) {
      throw new UnauthorizedException();
    }

    request.user = authenticatedUser;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
