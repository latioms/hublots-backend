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
import { UserService } from "./users.service";

@ApiTags("Users")
@Controller("users")
@UseGuards(AuthenticatorGuard)
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get()
  @UseRoles(Role.ADMIN, Role.SUPPORT)
  @ApiOkResponse({
    type: GetAllUserResponseDto,
    description: "list of successfully loaded users",
  })
  async findAll(@Query() query: BulkQueryDto): Promise<GetAllUserResponseDto> {
    const users = await this.userService.findAll(query);
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
  async findOne(@Param("id") userId: any): Promise<GetOneUserResponseDto> {
    const user = await this.userService.findOne(userId);

    return new GetOneUserResponseDto({
      data: user,
      message: "Successfully retrieved user",
      status: ResponseStatus.SUCCESS,
    });
  }

  @Put(":id")
  @ApiOkResponse({
    type: GetOneUserResponseDto,
    description: "The user has been successfully modified",
  })
  async update(
    @Param("id") userId: string,
    @Body() updateUsersDto: UpdateUserDto,
  ): Promise<GetOneUserResponseDto> {
    try {
      const user = await this.userService.update(userId, updateUsersDto);
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
      await this.userService.delete(userId);
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

  @Put(":id/kyc-files")
  @ApiOkResponse({
    type: GetOneUserResponseDto,
    description: "Successfully uploaded user KYC images",
  })
  @UseInterceptors(FileInterceptor("file"))
  async uploadKYCImages(@Param("id") userId: string, @UploadedFiles() files) {
    try {
      const imageIds = [];
      for (const file of files) {
        const image = await this.fileUploadService.uploadImage(file);
        imageIds.push(image._id);
      }

      const user = await this.userService.addKYCImages(userId, imageIds);
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
