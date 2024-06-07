import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthenticatorGuard } from "../auth/auth.guard";
import { User, UserSchema } from "./schema/users.schema";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

import { FileUploadModule } from "../files/file-upload.module";

@Module({
  imports: [
    FileUploadModule.forRoot(process.env.DATABASE_HOST, "kycImages"),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: APP_GUARD,
      useClass: AuthenticatorGuard,
    },
    JwtService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
