import { Type, applyDecorators } from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from "@nestjs/swagger";
import { PaginatedResponseDataDto, ResponseDataDto } from "./api-dto";

export const ApiOkPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(PaginatedResponseDataDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponseDataDto) },
          {
            properties: {
              data: {
                type: "array",
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};

export const ApiCustomCreatedResponse = <TModel extends Type<any>>(
  model: TModel,
  isArray = false,
) => {
  return applyDecorators(
    ApiExtraModels(ResponseDataDto, model),
    ApiCreatedResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseDataDto) },
          {
            properties: {
              data: isArray
                ? {
                    type: "array",
                    items: { $ref: getSchemaPath(model) },
                  }
                : { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  );
};

export const ApiCustomOkResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(ResponseDataDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseDataDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  );
};
