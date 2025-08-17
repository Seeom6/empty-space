import * as mongoose from "mongoose";

import {
  MongooseBaseQueryOptions,
  RootFilterQuery,
  Document
} from "mongoose";
import * as mongodb from "mongodb";
import { AppError } from "@Package/error";

export type VDocument<V> = V & Document 

export interface BaseMongoInterface<V> {
  create({ doc, options }: { doc: V; options?: mongoose.SaveOptions }): Promise<VDocument<V>>;

  countDocuments({
    filter,
    options,
  }: {
    filter?: RootFilterQuery<VDocument<V>>;
    options?: (mongodb.CountOptions & MongooseBaseQueryOptions<VDocument<V>>) | null;
  });

  aggregate<T = any>({
    pipeline,
    options,
  }: {
    pipeline?: mongoose.PipelineStage[];
    options?: mongoose.AggregateOptions;
  }): Promise<T[]>;

  find({
    filter,
    projection,
    options,
  }: {
    filter?: mongoose.FilterQuery<VDocument<V>>;
    projection?: mongoose.ProjectionType<VDocument<V>>;
    options?: mongoose.QueryOptions<VDocument<V>>;
  }): Promise<VDocument<V>[]>;

  findOne({
    filter,
    projection,
    options,
    error,
  }: {
    filter?: mongoose.FilterQuery<VDocument<V>>;
    projection?: mongoose.ProjectionType<VDocument<V>>;
    options?: mongoose.QueryOptions<VDocument<V>>;
    error?: AppError;
  }): Promise<VDocument<V>> ;

}
