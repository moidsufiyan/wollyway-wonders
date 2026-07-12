import { v4 as uuidv4 } from 'uuid';
import { getCloudinary } from '../config/cloudinary.config.js';
import { env } from '../config/env.config.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';

export interface CloudinaryUploadResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
  mediaType: 'image' | 'video' | 'pdf';
}

export class CloudinaryService {
  private cloudinary = getCloudinary();

  /**
   * Generates a descriptive, search-friendly public ID following the format:
   * wollyway/{env}/products/{product-slug}/{uuid}
   */
  public generateProductPublicId(productSlug: string): string {
    const cleanSlug = productSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const environment = env.NODE_ENV || 'development';
    const uniqueId = uuidv4().slice(0, 8); // Short UUID to save string length but guarantee uniqueness
    return `wollyway/${environment}/products/${cleanSlug}/${uniqueId}`;
  }

  /**
   * Uploads a memory buffer to Cloudinary using secure server-side signed streaming.
   */
  public async uploadStream(
    fileBuffer: Buffer,
    publicId: string
  ): Promise<CloudinaryUploadResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          overwrite: true,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              new AppError(
                error?.message || 'Failed to upload asset to Cloudinary',
                HTTP_STATUS.INTERNAL_SERVER_ERROR
              )
            );
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            mediaType: 'image',
          });
        }
      );

      // Write the buffer to the stream
      uploadStream.end(fileBuffer);
    });
  }

  /**
   * Deletes a single asset from Cloudinary using its publicId.
   */
  public async deleteAsset(publicId: string): Promise<void> {
    try {
      const result = await this.cloudinary.uploader.destroy(publicId);
      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error(`Cloudinary delete returned: ${result.result}`);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete asset from Cloudinary';
      throw new AppError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Concurrent bulk deletion of multiple publicIds.
   */
  public async deleteAssetsConcurrently(publicIds: string[]): Promise<void> {
    if (!publicIds || publicIds.length === 0) return;

    // Concurrent map execution
    await Promise.all(publicIds.map((id) => this.deleteAsset(id)));
  }
}

export const cloudinaryService = new CloudinaryService();
