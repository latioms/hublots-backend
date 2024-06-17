import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { Locale, Role, UserEntity, VerificationStatus } from "../dto/users.dto";

@Schema()
export class User extends Document {
  @Prop({ required: true, default: uuidv4, unique: true })
  id: string;

  @Prop({ type: String, required: true })
  fullname: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    required: true,
    unique: true,
  })
  phoneNumber: string;

  @Prop({
    type: String,
    enum: VerificationStatus,
    required: true,
    default: VerificationStatus.NOT_SUBMITTED,
  })
  verificationStatus: VerificationStatus;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  isOnline: boolean;

  @Prop({
    type: String,
    enum: Locale,
    required: true,
    default: Locale.FR,
  })
  locale: Locale;

  @Prop({
    type: [String],
    enum: Role,
    required: true,
    default: [Role.CLIENT],
  })
  roles: Role[];

  @Prop({
    type: String,
    required: true,
  })
  address: string;

  @Prop({
    type: String,
    required: true,
  })
  password: string;

  @Prop({
    type: Boolean,
    required: true,
    default: true,
  })
  isActive: boolean;

  @Prop({
    type: Date,
    required: true,
    default: new Date(),
  })
  createdAt: Date;

  @Prop({
    type: Date,
    required: false,
  })
  updatedAt: Date;

  @Prop({
    type: Date,
    required: false,
  })
  deletedAt: Date;

  //reference to images
  @Prop({ type: [{ type: Types.ObjectId, ref: "Image", required: true }] })
  kycImages: Types.ObjectId[];

  //reference to logs
  @Prop({ type: [{ type: Types.ObjectId, ref: "Log", required: true }] })
  logs: Types.ObjectId[];

  toJSON() {
    const user = this.toObject();
    user.id = user._id;
    delete user._id;
    delete user.__v;
    return user;
  }

  constructor(entity: UserEntity) {
    super();
    Object.assign(this, entity);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

declare module "express" {
  export interface Request {
    user?: User;
  }
}
