import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { jwtConstants } from "../../constants/constants";
import { CreateUserDto } from "../users/dto";
import { User } from "../users/schema/users.schema";
import { UsersService } from "../users/users.service";

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
    }
    const payload = { username: user.email };
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
    if (user && user.password === password) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result as Omit<User, "password">;
    }
    return null;
  }
}
