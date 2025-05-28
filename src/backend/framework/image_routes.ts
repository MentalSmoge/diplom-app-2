import * as express from "express";
import multer from "multer";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";
import fs from "fs";

export function createImageRouter() {
    console.log("Created CreateImageRouter")
    const router = express.Router();
    const storage = multer.memoryStorage();
    const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB
    const imagesDir = path.join(__dirname, '../../public/images');
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
        console.log(`Created images directory: ${imagesDir}`);
    }

    // Загрузка изображения
    // @ts-ignore
    router.post('/upload', upload.single('image'), async (req, res) => {
        console.log("/upload")

        try {
            if (!req.file) {
                return res.status(400).json({ error: "No image uploaded" });
            }

            const optimizedImage = await sharp(req.file.buffer)
                .resize(1200, null, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 80, progressive: true })
                .toBuffer();

            const filename = `${uuidv4()}.jpg`;
            const imagePath = path.join(imagesDir, filename);

            await fs.promises.writeFile(imagePath, optimizedImage);
            res.status(201).json({ url: `/images/${filename}` });

        } catch (error) {
            console.error('Image upload error:', error);
            res.status(500).json({ error: "Error processing image" });
        }
    });

    return router;
}