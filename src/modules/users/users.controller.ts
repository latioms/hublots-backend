import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Request } from "express";
import { AuthenticatorGuard } from "../auth/auth.guard";
import { UseRoles } from "../auth/decorator/auth.decorator";
import { BulkQueryDto, ResponseMetadataDto } from "../dto";
import { FileUploadService } from "../files/file-upload.service";
import {
  CreateAccountDto,
  GetAllUserResponseDto,
  GetOneUserResponseDto,
  Role,
  UpdateUserDto,
  UserDto,
} from "./dto/users.dto";
import { UsersService } from "./users.service";

@ApiTags("Users")
@Controller("users")
@UseGuards(AuthenticatorGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get()
  @UseRoles(Role.ADMIN, Role.SUPPORT)
  @ApiOkResponse({
    type: GetAllUserResponseDto,
    description: "list of successfully loaded users",
  })
  async findAll(@Query() query: BulkQueryDto): Promise<GetAllUserResponseDto> {
    const users = await this.usersService.findAll(query);
    return new GetAllUserResponseDto({
      data: users.map((user) => new UserDto(user.toJSON())),
      page: query.page ?? 1,
      perpage: query.perpage ?? 10,
      status: HttpStatus.OK,
      message: "Successfully retrieved users",
    });
  }

  @Get("profile")
  @ApiOkResponse({
    type: GetOneUserResponseDto,
    description: "Successful user registration",
  })
  async getProfile(@Req() req: Request): Promise<GetOneUserResponseDto> {
    return new GetOneUserResponseDto({
      data: new UserDto(req.user.toJSON()),
      message: "Successfully retrieved user profile",
      status: HttpStatus.OK,
    });
  }

  @Put("profile")
  @ApiOkResponse({
    type: GetOneUserResponseDto,
    description: "The user has been successfully modified",
  })
  async updateProfile(
    @Req() req: Request,
    @Body() updateUsersDto: UpdateUserDto,
  ): Promise<GetOneUserResponseDto> {
    const user = await this.usersService.update(req.user.id, updateUsersDto);
    return new GetOneUserResponseDto({
      data: new UserDto(user.toJSON()),
      message: "Successfully retrieved user",
      status: HttpStatus.OK,
    });
  }

  @Get(":id")
  @UseRoles(Role.ADMIN, Role.SUPPORT)
  @ApiOkResponse({
    type: GetOneUserResponseDto,
    description: "User information successfully retrieved",
  })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiBadRequestResponse({ description: "Invalid user ID" })
  async findOne(@Param("id") userId: string): Promise<GetOneUserResponseDto> {
    const user = await this.usersService.findOne(userId);

    return new GetOneUserResponseDto({
      data: new UserDto(user.toJSON()),
      message: "Successfully retrieved user",
      status: HttpStatus.OK,
    });
  }

  @Put(":id")
  @UseRoles(Role.ADMIN, Role.SUPPORT)
  @ApiOkResponse({
    type: GetOneUserResponseDto,
    description: "The user has been successfully modified",
  })
  async update(
    @Param("id") userId: string,
    @Body() updateUsersDto: UpdateUserDto,
  ): Promise<GetOneUserResponseDto> {
    const user = await this.usersService.update(userId, updateUsersDto);
    return new GetOneUserResponseDto({
      data: new UserDto(user.toJSON()),
      message: "Successfully retrieved user",
      status: HttpStatus.OK,
    });
  }

  @Delete(":id")
  @UseRoles(Role.ADMIN)
  @ApiNoContentResponse({
    type: ResponseMetadataDto,
    description: "User successfully deleted",
  })
  async delete(@Param("id") userId: string): Promise<ResponseMetadataDto> {
    await this.usersService.delete(userId);
    return new ResponseMetadataDto({
      message: "Successfully deleted user",
      status: HttpStatus.NO_CONTENT,
    });
  }

  @Put("profile/kyc-files")
  @UseRoles(Role.CLIENT)
  @ApiOkResponse({
    type: GetOneUserResponseDto,
    description: "Successfully uploaded user KYC images",
  })
  @UseInterceptors(FileInterceptor("file"))
  async uploadKYCImages(@Req() req: Request, @UploadedFiles() files) {
    const imageIds = [];
    for (const file of files) {
      const image = await this.fileUploadService.uploadImage(file);
      imageIds.push(image._id);
    }

    const user = await this.usersService.addKYCImages(req.user.id, imageIds);
    return new GetOneUserResponseDto({
      data: new UserDto(user.toJSON()),
      message: "Successfully uploaded user KYC images",
      status: HttpStatus.OK,
    });
  }

  @Post("/new")
  @UseRoles(Role.ADMIN, Role.SUPPORT)
  @ApiCreatedResponse({
    type: GetOneUserResponseDto,
    description: "Successfully created user account",
  })
  async createUser(@Req() req: Request, @Body() newUser: CreateAccountDto) {
    const roles = req.user.roles;

    if (
      (!roles.includes(Role.ADMIN) && newUser.roles.includes(Role.ADMIN)) ||
      newUser.roles.includes(Role.SUPPORT)
    )
      throw new BadRequestException(
        "Only admin can create another admin or customer service account",
      );

    const user = await this.usersService.createAcount(newUser);
    return new GetOneUserResponseDto({
      data: new UserDto(user.toJSON()),
      message: "Successfully create user account",
      status: HttpStatus.OK,
    });
  }
}
