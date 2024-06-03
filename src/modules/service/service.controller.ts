import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBadGatewayResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Request } from "express";
import { AuthenticatorGuard } from "../auth/auth.guard";
import { Public, UseRoles } from "../auth/decorator/auth.decorator";
import { BulkQueryDto, ResponseMetadataDto, ResponseStatus } from "../dto";
import { Role } from "../users/dto";
import {
  AddServiceResponseDto,
  CreateServiceDto,
  GetAllServiceResponseDto,
  GetOneServiceResponseDto,
} from "./dto/service.dto";
import { ServiceService } from "./service.service";

@ApiTags("Services")
@Controller("services")
@UseGuards(AuthenticatorGuard)
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  @Get()
  @Public()
  @ApiOkResponse({
    type: GetAllServiceResponseDto,
    description: "list of successfully loaded services",
  })
  async findAll(
    @Query() query: BulkQueryDto,
  ): Promise<GetAllServiceResponseDto> {
    const services = await this.serviceService.findAll(query);
    return new GetAllServiceResponseDto({
      data: services,
      page: query.page ?? 1,
      perpage: query.perpage ?? 10,
      status: ResponseStatus.SUCCESS,
      message: "Successfully retrieved services",
    });
  }

  @Post("new")
  @UseRoles(Role.PROVIDER, Role.SUPPORT)
  @ApiCreatedResponse({
    type: AddServiceResponseDto,
    description: "Service Created Sucessfully",
  })
  async create(
    @Req() request: Request,
    @Body() createServiceDto: CreateServiceDto,
  ): Promise<AddServiceResponseDto> {
    if (
      !createServiceDto.provider &&
      !request.user.roles.includes(Role.PROVIDER)
    ) {
      throw new BadRequestException("provider must be provider");
    }

    try {
      const service = await this.serviceService.add({
        ...createServiceDto,
        provider: request.user.roles.includes(Role.PROVIDER)
          ? request.user.id
          : createServiceDto.provider,
      });
      return new AddServiceResponseDto({
        data: service,
        message: "Service Created Sucessfully",
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

  @Get(":id")
  @ApiOkResponse({
    type: GetOneServiceResponseDto,
    description: "Service information successfully retrieved",
  })
  @ApiNotFoundResponse({ description: "Service not found" })
  @ApiBadGatewayResponse({ description: "Invalid service ID" })
  async findOne(
    @Param("id") serviceId: string,
  ): Promise<GetOneServiceResponseDto> {
    const service = await this.serviceService.findOne(serviceId); // Call the findOne method with the serviceId parameter
    return new GetOneServiceResponseDto({
      data: service,
      message: "Successfully retrieved service",
      status: ResponseStatus.SUCCESS,
    });
  }

  @Delete(":id")
  @UseRoles(Role.PROVIDER)
  @ApiNoContentResponse({
    type: ResponseMetadataDto,
    description: "Service successfully deleted",
  })
  async delete(@Param("id") serviceId: string): Promise<ResponseMetadataDto> {
    await this.serviceService.delete(serviceId);
    return new ResponseMetadataDto({
      status: ResponseStatus.SUCCESS,
      message: "Service successfully deleted",
    });
  }
}
