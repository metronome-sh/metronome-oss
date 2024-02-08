import { cache } from '@metronome/cache';
import { $ } from 'execa';
import * as semver from 'semver';
import { serverOnly$ } from 'vite-env-only';

export const checkForProjectClientUpdates = serverOnly$(async (currentClientVersion: string) => {
  const latestClientVersion = await cache.remember(
    'latestMetronomeClientVersion',
    async () => {
      const { stdout } = await $`npm view @metronome-sh/react version`;
      return stdout.trim();
    },
    60 * 60 * 24,
  );

  const needsToUpdate = false;

  try {
    semver.lt(currentClientVersion, latestClientVersion);
  } catch (error) {
    console.error(error);
  }

  return {
    latestClientVersion,
    needsToUpdate: currentClientVersion === '0.0.0' ? false : needsToUpdate,
  };
})!;
