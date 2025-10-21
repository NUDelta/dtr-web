import type { Buffer } from 'node:buffer';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectTaggingCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  PutObjectTaggingCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { R2_ACCESS_KEY_ID, R2_BUCKET, R2_ENDPOINT, R2_SECRET_ACCESS_KEY } from './consts';

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  // We intentionally don't throw here to keep dev ergonomics;
  // the route will return a 500 with a clear error message when needed.
  console.error('[ERROR] R2 configuration environment variables are missing.');
}

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT, // e.g., https://<accountid>.r2.cloudflarestorage.com
  credentials: R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY
    ? {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      }
    : undefined,
});

export async function r2Head(key: string) {
  return r2Client.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}

export async function r2Get(key: string) {
  return r2Client.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}

export async function r2Put(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string,
  cacheControl = 'public, max-age=31536000, immutable',
) {
  return r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: cacheControl,
    }),
  );
}

export async function r2PutTags(key: string, tags: Record<string, string>) {
  const TagSet = Object.entries(tags).map(([Key, Value]) => ({ Key, Value }));
  return r2Client.send(
    new PutObjectTaggingCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Tagging: { TagSet },
    }),
  );
}

export async function r2GetTags(key: string) {
  return r2Client.send(
    new GetObjectTaggingCommand({
      Bucket: R2_BUCKET,
      Key: key,
    }),
  );
}

export async function r2List(prefix: string, continuationToken?: string) {
  return r2Client.send(
    new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Prefix: prefix,
      ContinuationToken: continuationToken,
      MaxKeys: 1000,
    }),
  );
}

export async function r2Delete(key: string) {
  return r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}
