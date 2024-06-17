import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNumber, IsString, ValidateNested } from "class-validator";
import { OfferItemDto } from "./ofer-item.dto";
import { Type } from "class-transformer";

export class CreateOfferDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsNumber()
  @ApiProperty()
  price: number;

  @IsNumber()
  @ApiProperty()
  estimated_duration: number;

  constructor(createOffer: CreateOfferDto) {
    Object.assign(this, createOffer);
  }
}

export class UpdateOfferDto extends PartialType(CreateOfferDto) {}

export class OfferEntity extends CreateOfferDto {
  @IsString()
  @ApiProperty()
  id: string;
}

export class OfferDetailsDto extends OfferEntity {
  @ApiProperty({ type: [OfferItemDto] })
  @Type(() => OfferItemDto)
  @ValidateNested({ each: true })
  items: OfferItemDto[];
}
