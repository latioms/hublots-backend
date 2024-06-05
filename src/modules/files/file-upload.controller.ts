import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { FileUploadService } from "./file-upload.service";

@Controller("files")
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(@UploadedFile() file) {
    const image = await this.fileUploadService.uploadImage(file);
    return { imageId: image._id };
  }

  @Get(":id")
  async getFile(@Param("id") id: string, @Res() res: Response) {
    const fileStream = await this.fileUploadService.getImageStream(id);
    fileStream.pipe(res);
  }
}
