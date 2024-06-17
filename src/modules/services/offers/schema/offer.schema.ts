import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "src/modules/users/schema/user.schema";
import { v4 as uuidv4 } from "uuid";
import { OfferItem } from "./offer-item.schema";

@Schema()
export class Offer extends Document {
  @Prop({ required: true, default: uuidv4, unique: true })
  id: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({
    type: Number,
    required: true,
  })
  estimatedDuration: number;

  // reference to service
  @Prop({ required: true, type: Types.ObjectId, ref: "Service" })
  serviceId: string;

  //reference to offer items
  @Prop({
    type: [{ type: Types.ObjectId, ref: OfferItem.name, required: true }],
    default: [],
  })
  items: Types.ObjectId[];

  // reference to provider
  @Prop({ required: true, type: Types.ObjectId, ref: User.name })
  provider: string;

  // reference to creator
  @Prop({ required: true, type: Types.ObjectId, ref: User.name })
  createdBy: string;

  toJSON() {
    const user = this.toObject();
    user.id = user._id;
    delete user._id;
    delete user.__v;
    return user;
  }

  constructor(content: Offer) {
    super();
    Object.assign(this, content);
  }
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
