import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Document, Model } from "mongoose";
import { BulkQueryDto } from "src/modules/dto";
import { Offer } from "./schema/offer.schema";
import { CreateOfferDto, UpdateOfferDto } from "./dto/offer.dto";

@Injectable()
export class OffersService<T extends Document = Offer> {
  constructor(@InjectModel(Offer.name) private readonly offerModel: Model<T>) {}

  async create(data: CreateOfferDto): Promise<T> {
    return new this.offerModel({
      ...data,
      updatedAt: new Date(),
      createdAt: new Date(),
    }).save();
  }

  async findOne(serviceId: string): Promise<T> {
    return this.offerModel.findById(serviceId).exec();
  }

  async findAll(query: BulkQueryDto): Promise<T[]> {
    return this.offerModel
      .find()
      .limit(query.perpage ?? 10)
      .skip(query.page ?? 1)
      .exec();
  }

  async delete(offerId: string): Promise<void> {
    const service = await this.offerModel.findByIdAndDelete(offerId).exec();
    if (!service)
      throw new NotFoundException(`Offer with id ${offerId} not found`);
  }

  async update(offerId: string, data: UpdateOfferDto): Promise<T> {
    return this.offerModel
      .findByIdAndUpdate(
        offerId,
        { ...data, updatedAt: new Date() },
        { new: true },
      )
      .exec();
  }
}
