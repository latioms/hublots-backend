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
  estimated_duration: number;

  @IsArray()
  @Type(() => CreateOfferItemDto)
  @ValidateNested({ each: true })
  @ApiPropertyOptional({ type: [CreateOfferItemDto] })
  items: CreateOfferItemDto[] = [];

  constructor(createOffer: CreateOfferDto) {
    Object.assign(this, createOffer);
  }
}

export class UpdateOfferDto extends PartialType(
  OmitType(CreateOfferDto, ["items"]),
) {}

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
