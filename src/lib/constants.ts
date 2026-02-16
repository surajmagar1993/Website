export const AUTH_CONFIG = {
  SHADOW_DOMAIN: '@genesoft.internal',
};

/**
 * Transforms a username to a shadow email.
 * If the input already contains '@', it's returned as is.
 */
export function toShadowEmail(username: string): string {
  if (username.includes('@')) return username.trim();
  return `${username.trim().toLowerCase()}${AUTH_CONFIG.SHADOW_DOMAIN}`;
}

/**
 * Extracts the username part from a shadow email.
 */
export function fromShadowEmail(email: string): string {
  if (!email.endsWith(AUTH_CONFIG.SHADOW_DOMAIN)) return email;
  return email.replace(AUTH_CONFIG.SHADOW_DOMAIN, '');
}
