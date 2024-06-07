import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { jwtConstants } from "../../../constants/constants";
import {
  CreateUserDto,
  GoogleSignInDto,
  Locale,
  VerificationStatus,
} from "../../users/dto/users.dto";
import { UsersService } from "../../users/users.service";

@Injectable()
export class GoogleAuthService {
  private google: OAuth2Client;

  constructor(
    private userService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    this.google = new OAuth2Client(
      process.env.AUTH_GOOGLE_CLIENT_ID,
      process.env.AUTH_GOOGLE_CLIENT_SECRET,
    );
  }

  async getProfileByToken(loginDto: GoogleSignInDto): Promise<string> {
    const ticket = await this.google.verifyIdToken({
      idToken: loginDto.idToken,
      audience: [process.env.AUTH_GOOGLE_CLIENT_ID],
    });

    const data = ticket.getPayload();

    if (!data) {
      throw new UnprocessableEntityException(
        "Could not process id token payload",
      );
    }

    return this.authenticateUser(data);
  }

  async authenticateUser(data: TokenPayload) {
    const payload: CreateUserDto = {
      fullname: data.name,
      email: data.email,
      phoneNumber: null,
      address: null,
      isOnline: true,
      verificationStatus: VerificationStatus.NOT_SUBMITTED,
      locale: data.locale as Locale,
      password: null,
    };
    const existingUser = await this.userService.findByEmail(data.email);
    if (!existingUser) {
      await this.userService.register(payload);
    }
    return this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
    });
  }
}
