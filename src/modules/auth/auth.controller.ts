import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { ApiCreatedResponse, ApiTags } from "@nestjs/swagger";
import { ResponseMetadataDto, ResponseStatus } from "../dto";
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
      status: ResponseStatus.SUCCESS,
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
      status: ResponseStatus.SUCCESS,
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
    try {
      const { accessToken, user } =
        await this.authService.singUp(createUserDto);
      return new RegisterUserResponseDto({
        accessToken,
        data: new UserDto(user.toJSON()),
        status: ResponseStatus.SUCCESS,
        message: "Successfully register user",
      });
    } catch (error) {
      throw new HttpException(
        new ResponseMetadataDto({
          message: error.message,
          status: ResponseStatus.ERROR,
        }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
