import { remember } from '@epic-web/remember';
import DeviceDetector from 'device-detector-js';

export const deviceDetector = remember('deviceDtector', () => {
  return new DeviceDetector();
});
