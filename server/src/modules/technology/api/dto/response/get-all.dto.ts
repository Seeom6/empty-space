import { TechnologyDocument } from "@Modules/technology/data";
import { parsImageUrl } from "@Package/file";

export function getAllTechnologyDto(data: TechnologyDocument[]) {
    return data.map((item) => {
        return {
            id: item._id.toString(),
            name: item.name,
            description: item.description,
            status: item.status,
            icon: parsImageUrl(item.icon),
            website: item.website,
            version: item.version,
            category: item.category,
        };
    });
}