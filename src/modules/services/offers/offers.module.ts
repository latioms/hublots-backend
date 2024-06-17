import { Module } from "@nestjs/common";
import { OffersService } from "./offers.service";
import { OffersController } from "./offers.controller";
import { Offer, OfferSchema } from "./schema/offer.schema";
import { OfferItem, OfferItemSchema } from "./schema/offer-item.schema";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Offer.name, schema: OfferSchema }]),
    MongooseModule.forFeature([
      { name: OfferItem.name, schema: OfferItemSchema },
    ]),
  ],
  providers: [OffersService],
  controllers: [OffersController],
})
export class OffersModule {}
