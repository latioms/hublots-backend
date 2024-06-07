import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Request } from "express";
import { AuthenticatorGuard } from "../auth/auth.guard";
import { UseRoles } from "../auth/decorator/auth.decorator";
import { BulkQueryDto, ResponseMetadataDto, ResponseStatus } from "../dto";
import { FileUploadService } from "../files/file-upload.service";
import {
  GetAllUserResponseDto,
  GetOneUserResponseDto,
  Role,
  UpdateUserDto,
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
      data: users,
      page: query.page ?? 1,
      perpage: query.perpage ?? 10,
      status: ResponseStatus.SUCCESS,
      message: "Successfully retrieved users",
    });
  }

  @Get(":id")
  @ApiOkResponse({
    type: GetOneUserResponseDto,
    description: "User information successfully retrieved",
  })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiBadRequestResponse({ description: "Invalid user ID" })
  async findOne(@Param("id") userId: string): Promise<GetOneUserResponseDto> {
    const user = await this.usersService.findOne(userId);

    return new GetOneUserResponseDto({
      data: user,
      message: "Successfully retrieved user",
      status: ResponseStatus.SUCCESS,
    });
  }

  @Get("profile")
  @UseGuards(AuthenticatorGuard)
  @ApiOkResponse({
    type: GetOneUserResponseDto,
    description: "Successful user registration",
  })
  async getProfile(@Req() req: Request): Promise<GetOneUserResponseDto> {
    return new GetOneUserResponseDto({
      data: req.user,
      message: "Successfully retrieved user profile",
      status: ResponseStatus.SUCCESS,
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
    try {
      const user = await this.usersService.update(req.user.id, updateUsersDto);
      return new GetOneUserResponseDto({
        data: user,
        message: "Successfully retrieved user",
        status: ResponseStatus.SUCCESS,
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
    try {
      const user = await this.usersService.update(userId, updateUsersDto);
      return new GetOneUserResponseDto({
        data: user,
        message: "Successfully retrieved user",
        status: ResponseStatus.SUCCESS,
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

  @Delete(":id")
  @UseRoles(Role.ADMIN)
  @ApiOkResponse({
    type: ResponseMetadataDto,
    description: "User successfully deleted",
  })
  async delete(@Param("id") userId: string): Promise<ResponseMetadataDto> {
    try {
      await this.usersService.delete(userId);
      return new ResponseMetadataDto({
        message: "Successfully deleted user",
        status: ResponseStatus.ERROR,
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

  @Put("profile/kyc-files")
  @UseRoles(Role.CLIENT)
  @ApiOkResponse({
    type: GetOneUserResponseDto,
    description: "Successfully uploaded user KYC images",
  })
  @UseInterceptors(FileInterceptor("file"))
  async uploadKYCImages(@Req() req: Request, @UploadedFiles() files) {
    try {
      const imageIds = [];
      for (const file of files) {
        const image = await this.fileUploadService.uploadImage(file);
        imageIds.push(image._id);
      }

      const user = await this.usersService.addKYCImages(req.user.id, imageIds);
      return new GetOneUserResponseDto({
        data: user,
        message: "Successfully uploaded user KYC images",
        status: ResponseStatus.SUCCESS,
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
