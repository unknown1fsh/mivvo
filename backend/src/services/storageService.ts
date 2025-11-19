/**
 * Storage Service
 * 
 * Cloud storage (AWS S3/Cloudinary) entegrasyonu.
 * Image optimization ve file upload yönetimi.
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getEnv } from '../utils/envValidation';
import { logError, logInfo } from '../utils/logger';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

// S3 Client instance
let s3Client: S3Client | null = null;

/**
 * S3 Client oluştur
 */
function getS3Client(): S3Client | null {
  if (s3Client) {
    return s3Client;
  }

  const env = getEnv();
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'eu-west-1';
  const bucketName = process.env.AWS_S3_BUCKET_NAME;

  if (!accessKeyId || !secretAccessKey || !bucketName) {
    logInfo('AWS S3 yapılandırması eksik, local storage kullanılıyor');
    return null;
  }

  s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return s3Client;
}

/**
 * Dosya yükle (S3 veya local)
 */
export interface UploadFileOptions {
  file: Buffer;
  fileName: string;
  folder?: string;
  contentType?: string;
  optimizeImage?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface UploadFileResult {
  url: string;
  path: string;
  size: number;
  optimized?: boolean;
}

export async function uploadFile(options: UploadFileOptions): Promise<UploadFileResult> {
  const {
    file,
    fileName,
    folder = 'uploads',
    contentType,
    optimizeImage = true,
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 85,
  } = options;

  try {
    let processedFile = file;
    let finalContentType = contentType || 'application/octet-stream';
    let optimized = false;

    // Image optimization
    if (optimizeImage && file.length > 0) {
      const isImage = contentType?.startsWith('image/') || 
                     fileName.match(/\.(jpg|jpeg|png|webp|gif)$/i);

      if (isImage) {
        try {
          const image = sharp(file);
          const metadata = await image.metadata();

          // Resize if needed
          if (metadata.width && metadata.width > maxWidth) {
            processedFile = await image
              .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
              .jpeg({ quality })
              .toBuffer();
            optimized = true;
            finalContentType = 'image/jpeg';
            logInfo('Image optimized', { 
              originalSize: file.length, 
              optimizedSize: processedFile.length,
              fileName 
            });
          } else {
            processedFile = file;
          }
        } catch (error) {
          logError('Image optimization failed', error);
          processedFile = file; // Fallback to original
        }
      }
    }

    const s3Client = getS3Client();

    if (s3Client) {
      // Upload to S3
      const key = `${folder}/${Date.now()}-${fileName}`;
      const bucketName = process.env.AWS_S3_BUCKET_NAME!;

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: processedFile,
        ContentType: finalContentType,
        ACL: 'public-read', // Public access for images
      });

      await s3Client.send(command);

      const url = `https://${bucketName}.s3.${process.env.AWS_REGION || 'eu-west-1'}.amazonaws.com/${key}`;

      logInfo('File uploaded to S3', { fileName, url, size: processedFile.length });

      return {
        url,
        path: key,
        size: processedFile.length,
        optimized,
      };
    } else {
      // Local storage fallback
      const uploadDir = path.join(process.cwd(), 'uploads', folder);
      await fs.mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, `${Date.now()}-${fileName}`);
      await fs.writeFile(filePath, processedFile);

      const url = `/uploads/${folder}/${path.basename(filePath)}`;

      logInfo('File saved locally', { fileName, filePath, size: processedFile.length });

      return {
        url,
        path: filePath,
        size: processedFile.length,
        optimized,
      };
    }
  } catch (error) {
    logError('File upload failed', error);
    throw error;
  }
}

/**
 * Dosya sil
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const s3Client = getS3Client();

    if (s3Client) {
      // Delete from S3
      const bucketName = process.env.AWS_S3_BUCKET_NAME!;
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: filePath,
      });

      await s3Client.send(command);
      logInfo('File deleted from S3', { filePath });
      return true;
    } else {
      // Delete from local storage
      const fullPath = path.join(process.cwd(), filePath);
      await fs.unlink(fullPath);
      logInfo('File deleted locally', { filePath });
      return true;
    }
  } catch (error) {
    logError('File deletion failed', error);
    return false;
  }
}

/**
 * Dosya URL'i al
 */
export function getFileUrl(filePath: string): string {
  const s3Client = getS3Client();

  if (s3Client && process.env.AWS_S3_BUCKET_NAME) {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_REGION || 'eu-west-1';
    return `https://${bucketName}.s3.${region}.amazonaws.com/${filePath}`;
  } else {
    return filePath.startsWith('/') ? filePath : `/${filePath}`;
  }
}

