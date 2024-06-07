import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { jwtConstants } from "../../constants/constants";
import { CreateUserDto } from "../users/dto";
import { User } from "../users/schema/user.schema";
import { UsersService } from "../users/users.service";
import { Request } from "express";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async signIn(email: string, pass: string): Promise<string> {
    const user = await this.usersService.findByEmail(email);
    if (!bcrypt.compareSync(pass, user.password)) {
      throw new UnauthorizedException(
        "Incorrect email or password, please check your connection settings",
      );
    } else if (!user.isActive) {
      throw new ForbiddenException("User account was disactivated !!!");
    }
    const log = await this.usersService.createSignInLog(user._id as string);
    const payload = { username: user.email, logId: log._id };
    return this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
    });
  }

  async singUp(createUserDto: CreateUserDto) {
    const user = await this.usersService.register(createUserDto);
    const payload = { username: user.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
    });
    return { accessToken, user };
  }

  async validateUser(
    username: string,
    password: string,
  ): Promise<Omit<User, "password">> {
    const user = await this.usersService.findByEmail(username);
    if (user?.isActive && bcrypt.compareSync(password, user.password)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result as Omit<User, "password">;
    }
    return null;
  }

  async signOut(req: Request) {
    const [type, token] = req.headers.authorization?.split(" ") ?? [];
    const accessToken = type === "Bearer" ? token : undefined;
    if (accessToken) {
      const payload = await this.jwtService.verifyAsync(accessToken, {
        secret: process.env.JWT_KEY,
      });
      await this.usersService.createSignOutLog(payload.logId);
    }
  }
}
