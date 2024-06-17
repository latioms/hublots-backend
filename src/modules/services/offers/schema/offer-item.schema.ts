import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "src/modules/users/schema/user.schema";

@Schema({
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: function (doc, item) {
      item.id = item._id;
      delete item._id;
    },
  },
})
export class OfferItem extends Document {
  @Prop({
    type: String,
    required: true,
  })
  description: string;

  @Prop({
    type: String,
    required: true,
  })
  value: string;

  @Prop({
    type: Date,
    required: true,
    default: Date.now,
  })
  createdAt: Date;

  // reference to creator
  @Prop({ required: true, type: Types.ObjectId, ref: User.name })
  createdBy: string;
}

export const OfferItemSchema = SchemaFactory.createForClass(OfferItem);
