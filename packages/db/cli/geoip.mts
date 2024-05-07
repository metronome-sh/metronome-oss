import { env } from '@metronome/env';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import fetch from 'node-fetch';
import * as path from 'path';
import { pipeline as pipelineCb } from 'stream';
import * as tar from 'tar';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const { licenseKey } = env.geoip();

if (!licenseKey) {
  console.warn('No license key found, skipping geoip download');
  process.exit(0);
}

const pipeline = promisify(pipelineCb);

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// prettier-ignore
const url = `https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&license_key=${licenseKey}&suffix=tar.gz`;

const downloadsDir = './geoip';

// Ensure output directory exists
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

const downloadPath = path.join(downloadsDir, 'geoip-city.tar.gz');

const manifestPath = path.join(downloadsDir, 'manifest.json');

// Function to download file
const downloadFile = async (url: string, filePath: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  await pipeline(response.body!, fs.createWriteStream(filePath));

  return { lastModified: response.headers.get('last-modified') };
};

// Function to unzip file
const unzipFile = async (inputPath: string, outputPath: string) => {
  await tar.x({
    file: inputPath,
    C: outputPath,
  });
};

// Function to remove a file
const removeFile = async (filePath: string) => {
  await fsp.unlink(filePath);
};

async function getLatestGeoLite2Distro(): Promise<string | null> {
  try {
    const files = await fsp.readdir(downloadsDir, { withFileTypes: true });

    // Filter out only directories
    const directories = files
      .filter((file) => file.isDirectory() && file.name.startsWith('GeoLite2-City'))
      .map((dir) => dir.name)
      .sort();

    // Get the latest directory
    const latestDirectory = directories[directories.length - 1];

    return latestDirectory ? path.join(downloadsDir, latestDirectory) : null;
  } catch (err) {
    console.error(`An error occurred: ${err}`);
    return null;
  }
}

const setManifest = async ({ lastModified }: { lastModified: string | null }) => {
  const latestDirectory = await getLatestGeoLite2Distro();

  if (!latestDirectory) throw new Error('No latest directory found');

  const manifestString = JSON.stringify({
    database: path.join(dirname, '..', latestDirectory, 'GeoLite2-City.mmdb'),
    lastModified,
  });

  await fsp.writeFile(manifestPath, manifestString);
};

const checkForUpdates = async (url: string) => {
  // Check if manifest exists
  const manifestPath = path.join(downloadsDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return true;

  // Read the manifest
  const manifestString = await fsp.readFile(manifestPath, 'utf-8');
  const manifest = JSON.parse(manifestString);

  const response = await fetch(url, { method: 'HEAD' });

  return response.headers.get('last-modified') !== manifest.lastModified;
};

// Main function
(async () => {
  try {
    // Check for lastModified in manifest
    const updateAvailable = await checkForUpdates(url);

    if (!updateAvailable) {
      console.log('No updates available');
      return;
    }

    // Download the file
    const { lastModified } = await downloadFile(url, downloadPath);
    console.log(`Downloaded to ${downloadPath}`);

    // Unzip the file to the specified directory
    await unzipFile(downloadPath, downloadsDir);
    console.log(`Unzipped to ${downloadsDir}`);

    // Remove the downloaded .tar.gz file
    await removeFile(downloadPath);
    console.log(`Removed zipped file ${downloadPath}`);

    await setManifest({ lastModified });
    console.log('Updated manifest');
  } catch (err) {
    console.error(err);
  }
})();
