import { TechnologyDocument } from "@Modules/technology/data";
import { parsImageUrl } from "@Package/file";


export function getTechnologyDto(data: TechnologyDocument){
    return {
        id: data._id.toString(),
        name: data.name,
        description: data.description,
        status: data.status,
        icon: parsImageUrl(data.icon),
        website: data.website,
        version: data.version,
        category: data.category,
    }
}