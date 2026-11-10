import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { id, now } from "./store.mjs";
import { assert, text } from "./validation.mjs";
export const MAX_FILE = 20 * 1024 * 1024,
  MAX_TOTAL = 50 * 1024 * 1024;
export async function readBody(req, limit = 256 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    assert(size <= limit, "文件或内容过大", 413);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
export function createFiles(store) {
  const s3 = new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
  });
  const Bucket = process.env.S3_BUCKET;
  return {
    async upload(bytes, { owner, purpose, name }) {
      assert(
        bytes.length > 0 && bytes.length <= MAX_FILE,
        "单个文件最多 20 MB",
      );
      let mime,
        pages = 1,
        width,
        height;
      if (bytes.subarray(0, 5).toString() === "%PDF-") {
        let pdf;
        try {
          pdf = await PDFDocument.load(bytes, { ignoreEncryption: false });
        } catch {
          assert(false, "PDF 无法读取，请检查是否加密或损坏");
        }
        pages = pdf.getPageCount();
        assert(pages > 0 && pages <= 20, "每份 PDF 最多 20 页");
        mime = "application/pdf";
      } else {
        let meta;
        try {
          meta = await sharp(bytes, { limitInputPixels: 40000000 }).metadata();
        } catch {
          assert(false, "请上传 JPG、PNG、WebP 图片或 PDF");
        }
        assert(
          ["jpeg", "png", "webp"].includes(meta.format) && !meta.pages,
          "暂支持静态 JPG、PNG、WebP 图片和 PDF；HEIC 请先转为 JPG",
        );
        bytes = await sharp(bytes)
          .rotate()
          .resize({
            width: 3000,
            height: 3000,
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: 90 })
          .toBuffer();
        const converted = await sharp(bytes).metadata();
        width = converted.width;
        height = converted.height;
        mime = "image/jpeg";
      }
      const file = {
        id: id(),
        owner,
        purpose,
        name: text(name, 180) || "作业附件",
        mime,
        pages,
        width,
        height,
        size: bytes.length,
        createdAt: now(),
      };
      await s3.send(
        new PutObjectCommand({
          Bucket,
          Key: file.id,
          Body: bytes,
          ContentType: mime,
        }),
      );
      await store.put("file", file);
      return file;
    },
    async rotate(file) {
      const source = await s3.send(
        new GetObjectCommand({ Bucket, Key: file.id }),
      );
      const rotated = await sharp(
        Buffer.from(await source.Body.transformToByteArray()),
      )
        .rotate(90)
        .jpeg({ quality: 90 })
        .toBuffer();
      return this.upload(rotated, {
        owner: file.owner,
        purpose: file.purpose,
        name: file.name,
      });
    },
    async read(file) {
      return (await s3.send(new GetObjectCommand({ Bucket, Key: file.id })))
        .Body;
    },
    async validate(ids, owner, purpose, c) {
      assert(Array.isArray(ids) && ids.length <= 20, "最多上传 20 个附件");
      assert(new Set(ids).size === ids.length, "附件不能重复");
      const files = await Promise.all(ids.map((x) => store.get(x, c)));
      assert(
        files.every((f) => f && f.owner === owner && f.purpose === purpose),
        "附件不存在或无权使用",
        403,
      );
      assert(
        files.reduce((s, f) => s + f.size, 0) <= MAX_TOTAL,
        "附件合计最多 50 MB",
      );
      assert(
        files.reduce((s, f) => s + f.pages, 0) <= 20,
        "附件合计最多 20 页",
      );
      return files;
    },
  };
}
