import { escapeHtml, hasAnsiCodes, sanitize, sanitizeUrl } from './sanitize';
export * from './string';
export * from './markdown';
export * from './text';


export const textUtil = {
  escapeHtml,
  hasAnsiCodes,
  sanitize,
  sanitizeUrl,
};
