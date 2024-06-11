import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ObjectId } from "mongodb";
import { Model } from "mongoose";
import { BulkQueryDto } from "../dto/response.dto";
import { CreateServiceDto, ServiceDto, UpdateServiceDto } from "./dto";
import { Service } from "./schema/service.schema";

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name) private readonly serviceModel: Model<Service>,
  ) {}

  async create(data: CreateServiceDto): Promise<ServiceDto> {
    const createdService = await new this.serviceModel({
      ...data,
      updatedAt: new Date(),
      createdAt: new Date(),
    }).save();
    return new ServiceDto(createdService.toJSON());
  }

  async findOne(serviceId: string): Promise<ServiceDto> {
    const service = await this.serviceModel.findById(serviceId).exec();
    return new ServiceDto(service.toJSON());
  }

  async findAll(query: BulkQueryDto): Promise<ServiceDto[]> {
    const service = await this.serviceModel
      .find()
      .limit(query.perpage ?? 10)
      .skip(query.page ?? 1)
      .exec();
    return service.map((service) => new ServiceDto(service.toJSON()));
  }

  async delete(serviceId: string): Promise<void> {
    const service = await this.serviceModel.findByIdAndDelete(serviceId).exec();
    if (!service)
      throw new NotFoundException(`service with id ${serviceId} not found`);
  }

  async update(serviceId: string, data: UpdateServiceDto): Promise<ServiceDto> {
    const service = await this.serviceModel
      .findByIdAndUpdate(
        serviceId,
        { ...data, updatedAt: new Date() },
        { new: true },
      )
      .exec();
    return new ServiceDto(service.toJSON());
  }

  async addImages(serviceId: string, imageIds: string[]): Promise<Service> {
    const service = await this.serviceModel.findById(serviceId);
    if (!service)
      throw new NotFoundException(`Service with id ${serviceId} not found`);
    service.images.push(...imageIds.map((id) => new ObjectId(id)));
    return service.save();
  }
}
