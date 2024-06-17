import { Body, Controller, HttpStatus, Post, Req } from "@nestjs/common";
import { OffersService } from "./offers.service";
import { ApiTags } from "@nestjs/swagger";
import { CreateOfferDto, OfferEntity } from "./dto/offer.dto";
import { ResponseDataDto } from "src/helpers/api-dto";
import { ApiCustomCreatedResponse } from "src/helpers/api-decorator";
import { UseRoles } from "src/modules/auth/decorator/auth.decorator";
import { Role } from "src/modules/users/dto";
import { Request } from "express";

@ApiTags("Offers")
@Controller("offers")
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post("new")
  @UseRoles(Role.SUPPORT, Role.PROVIDER)
  @ApiCustomCreatedResponse(OfferEntity)
  async createOffer(@Req() request: Request, @Body() payload: CreateOfferDto) {
    const newOffer = await this.offersService.create(payload, request.user.id);
    return new ResponseDataDto({
      data: new OfferEntity(newOffer.toJSON()),
      message: "Offer created successfully",
      status: HttpStatus.CREATED,
    });
  }
}
