import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, _file, cb) {
    const folder = (req.query.folder as string) || "general";
    const dir = path.join(__dirname, `../public/${folder}`);

    // Create folder if not exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage: storage });

// POST /file?folder= users OR dogs OR posts
router.post("/", upload.single("file"), (req, res): void => {
  const folder = (req.query.folder as string) || "general";
  if (!req.file) {
    res.status(400).send({ error: "File upload failed" });
    return;
  }
  const fileUrl = `${req.protocol}://${req.get("host")}/public/${folder}/${
    req.file.filename
  }`;
  res.status(200).send({ url: fileUrl });
});

export default router;
