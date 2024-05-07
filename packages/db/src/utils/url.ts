import tldjs from 'tldjs';
const { getDomain, getPublicSuffix } = tldjs;

export function getDisplayNameFromURL(incomingUrl: string): string | null {
  try {
    const url = new URL(incomingUrl);

    // Remove 'www.' prefix if it exists
    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.substring(4);
    }

    // Use tldjs to get the domain name without the TLD
    const domain = getDomain(url.hostname);
    const sufix = getPublicSuffix(url.hostname);

    if (domain && sufix) {
      return domain.replace(`.${sufix}`, '');
    }
  } catch (error) {
    return '';
  }

  return '';
}
