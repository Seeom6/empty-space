import { DepartmentStatus } from "../types/department-status.type";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { VDocument } from "@Infrastructure/database";

export type DepartmentDocument = VDocument<Department>

@Schema({
    timestamps: true, // Adds createdAt and updatedAt automatically
    collection: 'departments'
})
export class Department {
    _id?: string;

    @Prop({
        required: true,
        type: String,
        trim: true,
        maxlength: 255,
        minlength: 3
    })
    name: string;

    @Prop({
        type: String,
        trim: true,
        maxlength: 1000
    })
    description?: string;

    @Prop({
        type: String,
        enum: Object.values(DepartmentStatus),
        default: DepartmentStatus.ACTIVE,
        index: true
    })
    status?: string;

    @Prop({
        type: Boolean,
        default: false,
        index: true
    })
    isDeleted?: boolean;

    // Audit fields
    createdAt?: Date;
    updatedAt?: Date;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);

// Performance-critical indexes
DepartmentSchema.index({ name: 1 }, {
    unique: true,
    partialFilterExpression: { isDeleted: false }
});

// Compound indexes for optimized queries
DepartmentSchema.index({ isDeleted: 1, status: 1 });
DepartmentSchema.index({ status: 1, isDeleted: 1, name: 1 });
DepartmentSchema.index({ createdAt: 1 });
DepartmentSchema.index({ updatedAt: 1 });

// Text index for search functionality
DepartmentSchema.index({
    name: 'text',
    description: 'text'
}, {
    weights: { name: 10, description: 5 },
    name: 'department_text_index'
});