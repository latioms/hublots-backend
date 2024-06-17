import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BulkQueryDto } from "src/helpers/api-dto";
import { CreateOfferDto, UpdateOfferDto } from "./dto/offer.dto";
import { Offer } from "./schema/offer.schema";
import { OfferItem } from "./schema/offer-item.schema";
import { CreateOfferItemDto } from "./dto/ofer-item.dto";
import { ObjectId } from "mongodb";

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(Offer.name) private readonly offerModel: Model<Offer>,
    @InjectModel(OfferItem.name)
    private readonly offerItemModel: Model<OfferItem>,
  ) {}

  async create(
    { items, ...data }: CreateOfferDto,
    createdBy: string,
  ): Promise<Offer> {
    let createdItemIds: string[] = [];
    if (items.length > 0) {
      const createdItems = await this.offerItemModel.insertMany(
        items.map((item) => ({ ...item, createdBy })),
      );
      createdItemIds = createdItems.map((_) => _._id as string);
    }

    return new this.offerModel({
      ...data,
      createdBy,
      items: createdItemIds,
      updatedAt: new Date(),
      createdAt: new Date(),
    }).save();
  }

  async bulkCreate(
    bulkData: CreateOfferDto[],
    createdBy: string,
  ): Promise<Offer[]> {
    const session = await this.offerModel.startSession();
    session.startTransaction();
    try {
      let newOffers: Offer[] = [];
      for (const { items, ...data } of bulkData) {
        let createdItemIds: string[] = [];
        if (items.length > 0) {
          const createdItems = await this.offerItemModel.insertMany(
            items.map((item) => ({ ...item, createdBy })),
            { session },
          );
          createdItemIds = createdItems.map((_) => _._id as string);
          newOffers.push(
            new this.offerModel({
              ...data,
              createdBy,
              items: createdItemIds,
              updatedAt: new Date(),
              createdAt: new Date(),
            }),
          );
        }
      }
      newOffers = await this.offerModel.insertMany(newOffers, { session });
      await session.commitTransaction();
      return newOffers;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findOne(serviceId: string): Promise<Offer> {
    return this.offerModel.findById(serviceId).populate("items").exec();
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

  async addItems(offerId: string, items: CreateOfferItemDto[]): Promise<Offer> {
    const offer = await this.offerModel.findById(offerId);
    if (!offer) {
      throw new NotFoundException(`Offer with id ${offerId} not found`);
    }

    const session = await this.offerModel.startSession();
    session.startTransaction();

    const newItems = await this.offerItemModel.insertMany(
      items.map((item) => new this.offerItemModel(item)),
      { session },
    );

    try {
      offer.items.push(...newItems.map((_) => new ObjectId(_._id as string)));
      return (await offer.save({ session })).populate("items");
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async removedItems(offerId: string, itemIds: string[]): Promise<Offer> {
    const offer = await this.offerModel.findById(offerId);
    if (!offer) {
      throw new NotFoundException(`Offer with id ${offerId} not found`);
    }

    const session = await this.offerModel.startSession();
    session.startTransaction();

    await this.offerItemModel.deleteMany(
      itemIds.map((id) => new ObjectId(id)),
      { session },
    );

    try {
      offer.items = offer.items.filter(
        (item) => !itemIds.some((id) => item.toString() === id),
      );
      return (await offer.save({ session })).populate("items");
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
