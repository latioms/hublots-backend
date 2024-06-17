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
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import {
  ApiBadGatewayResponse,
  ApiConsumes,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Request } from "express";
import {
  ApiCustomCreatedResponse,
  ApiCustomOkResponse,
  ApiOkPaginatedResponse,
} from "src/helpers/api-decorator";
import {
  BulkQueryDto,
  PaginatedResponseDataDto,
  ResponseMetadataDto,
  ResponseDataDto,
} from "src/helpers/api-dto";
import { Public, UseRoles } from "../auth/decorator/auth.decorator";
import { FileUploadService } from "../files/file-upload.service";
import { Role } from "../users/dto";
import {
  CreateServiceDto,
  ServiceDetailsDto,
  ServiceEntity,
} from "./dto/service.dto";
import { ServicesService } from "./services.service";
import { UpdateOfferDto } from "./offers/dto/offer.dto";

@ApiTags("Services")
@Controller("services")
export class ServicesController {
  constructor(
    private serviceService: ServicesService,
    private fileUploadService: FileUploadService,
  ) {}

  @Get()
  @Public()
  @ApiOkPaginatedResponse(ServiceEntity)
  async findAll(
    @Query() query: BulkQueryDto,
  ): Promise<PaginatedResponseDataDto<ServiceEntity>> {
    const services = await this.serviceService.findAll(query);
    return new PaginatedResponseDataDto({
      data: services.map((service) => new ServiceEntity(service.toJSON())),
      page: query.page ?? 1,
      perpage: query.perpage ?? 10,
      status: HttpStatus.OK,
      message: "Successfully retrieved services",
    });
  }

  @Post("new")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  @UseRoles(Role.PROVIDER, Role.SUPPORT)
  @ApiCustomCreatedResponse(ServiceEntity)
  async create(
    @UploadedFile() file,
    @Req() request: Request,
    @Body() createServiceDto: CreateServiceDto,
  ): Promise<ResponseDataDto<ServiceEntity>> {
    if (
      !createServiceDto.provider &&
      !request.user.roles.includes(Role.PROVIDER)
    ) {
      throw new BadRequestException("provider must be provider");
    }

    const newService = {
      ...createServiceDto,
      provider: request.user.roles.includes(Role.PROVIDER)
        ? request.user.id
        : createServiceDto.provider,
    };
    if (!createServiceDto.mainImageId && file) {
      const image = await this.fileUploadService.uploadImage(file);
      newService.mainImageId = image.id;
    }

    const service = await this.serviceService.create(
      newService,
      request.user.id,
    );

    return new ResponseDataDto({
      data: new ServiceEntity(service.toJSON()),
      message: "Service Created Sucessfully",
      status: HttpStatus.CREATED,
    });
  }

  @Get(":id")
  @ApiCustomOkResponse(ServiceDetailsDto)
  @ApiNotFoundResponse({ description: "Service not found" })
  @ApiBadGatewayResponse({ description: "Invalid service ID" })
  async findOne(
    @Param("id") serviceId: string,
  ): Promise<ResponseDataDto<ServiceDetailsDto>> {
    const service = await this.serviceService.findOne(serviceId); // Call the findOne method with the serviceId parameter
    return new ResponseDataDto({
      data: new ServiceDetailsDto(service.toJSON()),
      message: "Successfully retrieved service",
      status: HttpStatus.OK,
    });
  }

  @Put(":id")
  @ApiCustomOkResponse(ServiceDetailsDto)
  @ApiNotFoundResponse({ description: "Service not found" })
  @ApiBadGatewayResponse({ description: "Invalid service ID" })
  async update(
    @Req() request: Request,
    @Body() payload: UpdateOfferDto,
    @Param("id") serviceId: string,
  ): Promise<ResponseDataDto<ServiceDetailsDto>> {
    const service = await this.serviceService.update(
      serviceId,
      payload,
      request.user._id as string,
    );
    return new ResponseDataDto({
      data: new ServiceDetailsDto(service.toJSON()),
      message: "Successfully retrieved service",
      status: HttpStatus.OK,
    });
  }

  @Delete(":id")
  @UseRoles(Role.PROVIDER)
  @ApiNoContentResponse({
    type: ResponseMetadataDto,
    description: "Service successfully deleted",
  })
  async delete(
    @Req() request: Request,
    @Param("id") serviceId: string,
  ): Promise<ResponseMetadataDto> {
    await this.serviceService.delete(serviceId, request.user._id as string);
    return new ResponseMetadataDto({
      status: HttpStatus.NO_CONTENT,
      message: "Service successfully deleted",
    });
  }

  @Put(":id/images")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FilesInterceptor("files"))
  @UseRoles(Role.PROVIDER, Role.SUPPORT)
  @ApiCustomOkResponse(ServiceEntity)
  async uploadImages(
    @UploadedFiles() files,
    @Param("id") serviceId: string,
  ): Promise<ResponseDataDto<ServiceEntity>> {
    if (!Array.isArray(files)) {
      throw new BadRequestException("Except an array of files");
    }

    const imageIds: string[] = [];
    for (const file of files) {
      const image = await this.fileUploadService.uploadImage(file);
      imageIds.push(image.id);
    }

    const service = await this.serviceService.addImages(serviceId, imageIds);
    return new ResponseDataDto({
      data: new ServiceEntity(service.toJSON()),
      message: "Service Created Sucessfully",
      status: HttpStatus.CREATED,
    });
  }
}
