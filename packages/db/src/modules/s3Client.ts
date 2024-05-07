import { remember } from '@epic-web/remember';
import { env } from '@metronome/env';
import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';

export { HeadBucketCommand, CreateBucketCommand, PutObjectCommand } from '@aws-sdk/client-s3';

export const s3Client = remember('s3Client', () => {
  return new S3Client({
    ...env.s3().client,
  });
});

let bucketExists: true | undefined;
const { bucket } = env.s3();

export async function getBucket() {
  if (bucketExists) {
    return bucket;
  }

  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch (error) {
    if ((error as Error).name === 'NotFound') {
      await s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
    } else {
      console.error('Error', error);
    }
  }

  bucketExists = true;

  return bucket;
}

export async function directoryExists(directory: string) {
  const params = {
    Bucket: bucket,
    Prefix: directory.endsWith('/') ? directory : `${directory}/`,
    Delimiter: '/',
    MaxKeys: 1,
  };

  try {
    const command = new ListObjectsV2Command(params);
    const { Contents, CommonPrefixes } = await s3Client.send(command);

    const exists =
      (Contents && Contents.length > 0) || (CommonPrefixes && CommonPrefixes.length > 0);
    return exists;
  } catch (error) {
    return false;
  }
}

export async function deleteDirectory(directory: string) {
  const exists = await directoryExists(directory);

  if (!exists) {
    return;
  }

  const listParams = {
    Bucket: bucket,
    Prefix: directory.endsWith('/') ? directory : `${directory}/`,
  };

  try {
    const listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));

    if (!listedObjects.Contents?.length) return;

    const deleteParams = {
      Bucket: bucket,
      Delete: { Objects: listedObjects.Contents.map(({ Key }) => ({ Key })) },
    };

    await s3Client.send(new DeleteObjectsCommand(deleteParams));

    if (listedObjects.IsTruncated) {
      await deleteDirectory(directory);
    }
  } catch (error) {
    throw error;
  }
}
