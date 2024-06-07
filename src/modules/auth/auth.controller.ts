import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Post,
  Req,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  CreateUserDto,
  GoogleSignInDto,
  RegisterUserResponseDto,
  UserDto,
} from "../users/dto/users.dto";
import { AuthService } from "./auth.service";
import { Public } from "./decorator/auth.decorator";
import { SignInDto, SignInResponseDto } from "./dto/auth.dto";
import { GoogleAuthService } from "./google/google-auth.service";
import { Request } from "express";
import { ResponseMetadataDto } from "../dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private authGuard: GoogleAuthService,
  ) {}

  @ApiCreatedResponse({
    type: SignInResponseDto,
    description: "User Successfully signed in",
  })
  @Public()
  @Post("login")
  async signIn(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
    const accessToken = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
    );
    return new SignInResponseDto({
      accessToken,
      message: "User Successfully signed in",
      status: HttpStatus.OK,
    });
  }

  @ApiCreatedResponse({
    type: SignInResponseDto,
    description: "Successful user registration",
  })
  @Post("google-login")
  async googleSignIn(
    @Body() signInDto: GoogleSignInDto,
  ): Promise<SignInResponseDto> {
    const accessToken = await this.authGuard.getProfileByToken(signInDto);
    return new SignInResponseDto({
      accessToken,
      message: "Successfully signed user in",
      status: HttpStatus.OK,
    });
  }

  @Public()
  @Post("register")
  @ApiCreatedResponse({
    type: RegisterUserResponseDto,
    description: "Successful user registration",
  })
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<RegisterUserResponseDto> {
    const { accessToken, user } = await this.authService.singUp(createUserDto);
    return new RegisterUserResponseDto({
      accessToken,
      data: new UserDto(user.toJSON()),
      status: HttpStatus.CREATED,
      message: "Successfully register user",
    });
  }

  @Delete("/sign-out")
  @ApiNoContentResponse({
    type: ResponseMetadataDto,
    description: "Logout successfully",
  })
  async signOut(@Req() req: Request) {
    await this.authService.signOut(req);
    return new ResponseMetadataDto({
      message: "Successfully deleted user",
      status: HttpStatus.NO_CONTENT,
    });
  }
}
