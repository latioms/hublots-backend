import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateOfferItemDto {
  @IsString()
  @ApiProperty()
  description: string;

  @IsString()
  @ApiProperty()
  value: string;
}

export class UpdateOfferItemDto extends PartialType(CreateOfferItemDto) {}

export class OfferItemDto extends CreateOfferItemDto {
  @IsString()
  @ApiProperty()
  id: string;
}
