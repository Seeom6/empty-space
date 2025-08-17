import * as mongoose from "mongoose";
import {MongooseBaseQueryOptions, MongooseUpdateQueryOptions, QueryOptions} from "mongoose";

import {BaseMongoInterface, VDocument} from "../interface";
import mongodb from "mongodb";
import { AppError } from "@Package/error";

export abstract class BaseMongoRepository<V>
  implements BaseMongoInterface<V>
{
  protected constructor(private readonly entityModel: mongoose.Model<VDocument<V>>) {}

  async create({
    doc,
    options,
  }: {
    doc: V;
    options?: mongoose.SaveOptions;
  }): Promise<VDocument<V>> {
    return await new this.entityModel(doc).save(options) as unknown as VDocument<V>;
  }

  async countDocuments({
    filter,
    options,
  }: {
    filter?: mongoose.RootFilterQuery<VDocument<V>>;
    options?: (mongodb.CountOptions & MongooseBaseQueryOptions<VDocument<V>>) | null;
  }) {
    return this.entityModel.countDocuments(filter, options);
  }

  async aggregate<T = any>({
    pipeline,
    options,
  }: {
    pipeline?: mongoose.PipelineStage[];
    options?: mongoose.AggregateOptions;
  }) {
    return this.entityModel.aggregate(pipeline, options) as unknown as T[] ;
  }

  async find({
    filter,
    projection,
    options,
  }: {
    filter?: mongoose.FilterQuery<VDocument<V>>;
    projection?: mongoose.ProjectionType<VDocument<V>>;
    options?: mongoose.QueryOptions;
  }) {
    return this.entityModel.find(filter, projection, {
      ...options,
      lean: true,
    }) as unknown as VDocument<V>[];
  }

  async findOne({
    filter,
    projection,
    options,
    error,
  }: {
    filter?: mongoose.FilterQuery<VDocument<V>>;
    projection?: mongoose.ProjectionType<VDocument<V>>;
    options?: mongoose.QueryOptions<VDocument<V>>;
    error?: AppError;
  }): Promise<VDocument<V>> {
    const result = await this.entityModel.findOne(filter, projection, {
      ...options,
    });
    if (!result && error) {
      throw error;
    }
    return result as VDocument<V>;
  }

  async findById({
    id,
    projection,
    options,
    error,
  }: {
    id: string;
    projection?: mongoose.ProjectionType<VDocument<V>>;
    options?: mongoose.QueryOptions<VDocument<V>>;
    error?: AppError;
  }): Promise<VDocument<V>> {
    const result = await this.entityModel.findById(id, projection, {
      ...options,
      lean: true,
    }) as VDocument<V>;
    if (!result && error) {
      throw error;
    }
    return result;
  }

  async findOneAndUpdate({
    filter,
    update,
    options,
    error,
  }: {
    filter: mongoose.FilterQuery<VDocument<V>>;
    update: mongoose.UpdateQuery<VDocument<V>>;
    options?: mongoose.QueryOptions<VDocument<V>>;
    error?: AppError;
  }): Promise<VDocument<V>> {
    const result = await this.entityModel.findOneAndUpdate(filter, update, {
      ...options,
      new: true,
      lean: true,
    }) as VDocument<V>;
    if (!result && error) {
      throw error;
    }
    return result;
  }

  async findOneAndDelete({
    filter,
    options,
    error,
  }: {
    filter: mongoose.FilterQuery<VDocument<V>>;
    options?: mongoose.QueryOptions<VDocument<V>>;
    error?: AppError;
  }) {
    const result = await this.entityModel.findOneAndDelete(filter, {
      ...options,
    });
    if (!result && error) {
      throw error;
    }
    return result;
  }

  async updateOne({
    filter,
    update,
    options,
    error,
  }: {
    filter: mongoose.FilterQuery<VDocument<V>>;
    update: mongoose.UpdateQuery<VDocument<V>>;
    options?: (mongodb.UpdateOptions & MongooseUpdateQueryOptions<VDocument<V>>) | null
    error?: AppError;
  }) {
    const result = await this.entityModel.updateOne(filter, update, options);
    if (!result && error) {
      throw error;
    }
    return result;
  }

  async findByIdAndUpdate({
    id,
    update,
    options,
    error,
  }: {
    id: string;
    update: mongoose.UpdateQuery<VDocument<V>>;
    options?: QueryOptions<VDocument<V>> | null;
    error?: AppError;
  }) {
    const result = await this.entityModel.findByIdAndUpdate(id, update, options);
    if (!result && error) {
      throw error;
    }
    return result;
  }
}
