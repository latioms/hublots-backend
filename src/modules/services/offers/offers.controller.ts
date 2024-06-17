import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
} from "@nestjs/common";
import { OffersService } from "./offers.service";
import { ApiTags } from "@nestjs/swagger";
import { CreateOfferDto, OfferEntity, UpdateOfferDto } from "./dto/offer.dto";
import { ResponseDataDto } from "src/helpers/api-dto";
import { ApiCustomCreatedResponse } from "src/helpers/api-decorator";
import { UseRoles } from "src/modules/auth/decorator/auth.decorator";
import { Role } from "src/modules/users/dto";
import { Request } from "express";

@ApiTags("Service Offers")
@Controller("services/offers")
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post("new")
  @UseRoles(Role.SUPPORT, Role.PROVIDER)
  @ApiCustomCreatedResponse(OfferEntity)
  async createOffer(
    @Req() request: Request,
    @Body() payload: CreateOfferDto,
  ): Promise<ResponseDataDto<OfferEntity>> {
    const newOffer = await this.offersService.create(payload, request.user.id);
    return new ResponseDataDto({
      data: new OfferEntity(newOffer.toJSON()),
      message: "Offer created successfully",
      status: HttpStatus.CREATED,
    });
  }

  @Post("bulk-insert")
  @UseRoles(Role.SUPPORT, Role.PROVIDER)
  @ApiCustomCreatedResponse(OfferEntity)
  async createManyOffers(
    @Req() request: Request,
    @Body() payload: CreateOfferDto[],
  ): Promise<ResponseDataDto<OfferEntity[]>> {
    const newOffers = await this.offersService.bulkCreate(
      payload,
      request.user.id,
    );
    return new ResponseDataDto({
      data: newOffers.map((newOffer) => new OfferEntity(newOffer.toJSON())),
      message: "All offers created successfully",
      status: HttpStatus.CREATED,
    });
  }

  @Put(":id")
  @UseRoles(Role.SUPPORT, Role.PROVIDER)
  async updateOffer(
    @Param("id") offerId,
    @Body() payload: UpdateOfferDto,
  ): Promise<ResponseDataDto<OfferEntity>> {
    const updatedOffer = await this.offersService.update(offerId, payload);
    return new ResponseDataDto({
      data: new OfferEntity(updatedOffer.toJSON()),
      message: "All offers created successfully",
      status: HttpStatus.CREATED,
    });
  }
}
