import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FileUploadModule } from "../files/file-upload.module";
import { UsersModule } from "../users/users.module";
import { Service, ServiceSchema } from "./schema/service.schema";
import { ServiceController } from "./service.controller";
import { ServiceService } from "./service.service";

@Module({
  imports: [
    UsersModule,
    FileUploadModule.forRoot(process.env.DATABASE_HOST, "serviceImages"),
    MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
  ],
  providers: [ServiceService],
  controllers: [ServiceController],
  exports: [ServiceService],
})
export class ServiceModule {}
