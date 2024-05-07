import { deviceDetector } from '../modules/deviceDetector';

function getCategory(type?: string) {
  switch (type) {
    case 'desktop':
      return 'desktop';
    case 'tablet':
    case 'mobile':
    case 'phablet':
    case 'smartphone':
      return 'mobile';
    default:
      return 'unknown';
  }
}

export function getDeviceProps(userAgent: string) {
  const result = deviceDetector.parse(userAgent);
  const category = getCategory(result.device?.type);

  const type = result.device?.type || 'unknown';

  return { category, type };
}
