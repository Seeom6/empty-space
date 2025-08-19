import { PositionDocument } from "@Modules/position/data/position.schema";

export function getAllPositionDto(positions: PositionDocument[]){
    return positions.map((position) => {
        return {
            id: position._id,
            name: position.name,
            description: position.description,
            status: position.status,
        }
    })
}