import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
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
import { Public, UseRoles } from "../auth/decorator/auth.decorator";
import { BulkQueryDto, ResponseMetadataDto } from "../dto";
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
      status: HttpStatus.OK,
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

    const service = await this.serviceService.add({
      ...createServiceDto,
      provider: request.user.roles.includes(Role.PROVIDER)
        ? request.user.id
        : createServiceDto.provider,
    });
    return new AddServiceResponseDto({
      data: service,
      message: "Service Created Sucessfully",
      status: HttpStatus.CREATED,
    });
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
      status: HttpStatus.OK,
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
      status: HttpStatus.NO_CONTENT,
      message: "Service successfully deleted",
    });
  }
}
