import * as fs from "fs";
import * as multer from "multer";

import { extname, join } from "path";

import { storageFileKeys } from "../../../shared/config/file/file";
import { getEnvService } from "@Infrastructure/config/environments/env.config.module";
export const localFileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { key } = req.params;
    const env = getEnvService();
    const baseFilePath = env.get("app.baseUrl");
    const filePath = storageFileKeys[key] || env.get("app.baseUrl");
    const fullFilePath = join(baseFilePath, filePath);
    try {
      if (!fs.existsSync(fullFilePath)) {
        fs.mkdirSync(fullFilePath, {
          recursive: true,
        });
      }
      cb(null, fullFilePath);
    } catch (error) {
      console.error("Error On Create Folder:", error);
      cb(error, null);
    }
  },
  filename: (req, file, callback) => {
    const rawName = file.originalname;
    const decodedName = decodeURIComponent(rawName);
    const name = decodedName.split(".")[0];
    const fileExtName = extname(decodedName);
    const randomName = Array(12)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join("");
    callback(null, `${name}-${randomName}${fileExtName}`);
  },
});

