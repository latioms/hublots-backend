import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from "@nestjs/swagger";
import { IsArray, IsNumber, IsString, ValidateNested } from "class-validator";
import { CreateOfferItemDto, OfferItemDto } from "./ofer-item.dto";
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
  estimatedDuration: number;

  @IsString()
  @ApiProperty()
  serviceId: string;

  @IsArray()
  @Type(() => CreateOfferItemDto)
  @ValidateNested({ each: true })
  @ApiPropertyOptional({ type: [CreateOfferItemDto] })
  items: CreateOfferItemDto[] = [];

  constructor(createOffer: CreateOfferDto) {
    Object.assign(this, createOffer);
  }
}

export class OfferWithoutItemsDto extends OmitType(CreateOfferDto, ["items"]) {}
export class UpdateOfferDto extends PartialType(OfferWithoutItemsDto) {}

export class OfferEntity extends OfferWithoutItemsDto {
  @IsString()
  @ApiProperty()
  id: string;

  @ApiProperty({ type: [OfferItemDto] })
  @IsString({ each: true })
  items: string[];
}

export class OfferDetailsDto extends OfferWithoutItemsDto {
  @IsString()
  @ApiProperty()
  id: string;

  @ApiProperty({ type: [OfferItemDto] })
  @Type(() => OfferItemDto)
  @ValidateNested({ each: true })
  items: OfferItemDto[];
}
