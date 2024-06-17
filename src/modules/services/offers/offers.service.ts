import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BulkQueryDto } from "src/helpers/api-dto";
import { CreateOfferDto, UpdateOfferDto } from "./dto/offer.dto";
import { Offer } from "./schema/offer.schema";

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(Offer.name) private readonly offerModel: Model<Offer>,
  ) {}

  async create(data: CreateOfferDto, createdBy: string): Promise<Offer> {
    return new this.offerModel({
      ...data,
      createdBy,
      updatedAt: new Date(),
      createdAt: new Date(),
    }).save();
  }

  async findOne(serviceId: string): Promise<Offer> {
    return this.offerModel.findById(serviceId).exec();
  }

  async findAll(query: BulkQueryDto): Promise<Offer[]> {
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

  async update(offerId: string, data: UpdateOfferDto): Promise<Offer> {
    return this.offerModel
      .findByIdAndUpdate(
        offerId,
        { ...data, updatedAt: new Date() },
        { new: true },
      )
      .exec();
  }
}
