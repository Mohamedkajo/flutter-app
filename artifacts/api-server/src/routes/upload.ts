import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import path from "path";
import fs from "fs";
import crypto from "crypto";

export const uploadRouter = Router();

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Base64 upload endpoint (avoids multipart complexity)
uploadRouter.post("/upload", requireAuth, async (req, res): Promise<void> => {
  const { base64, filename, folder = "general" } = req.body;
  if (!base64 || !filename) { res.status(400).json({ error: "base64 and filename required" }); return; }
  const ext = path.extname(filename) || ".jpg";
  const name = `${crypto.randomBytes(8).toString("hex")}${ext}`;
  const subDir = path.join(UPLOAD_DIR, folder);
  if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true });
  const buffer = Buffer.from(base64.replace(/^data:.*;base64,/, ""), "base64");
  fs.writeFileSync(path.join(subDir, name), buffer);
  const url = `/api/uploads/${folder}/${name}`;
  res.json({ url, filename: name, size: buffer.length, mimetype: "image/*" });
});

// Serve uploaded files
uploadRouter.get("/uploads/:folder/:filename", (req, res): void => {
  const filePath = path.join(UPLOAD_DIR, req.params.folder, req.params.filename);
  if (!fs.existsSync(filePath)) { res.status(404).json({ error: "Not found" }); return; }
  res.sendFile(filePath);
});
