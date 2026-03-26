import { parsePhoneNumber } from 'react-phone-number-input';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import { onlyDigits } from './format-number';

/**
 * Normaliza telefone/WhatsApp para E.164 (ex.: +5511999998888).
 * Aceita valores legados: máscara BR, só dígitos, ou já E.164.
 *
 * @param {string | null | undefined} value
 * @param {string} [defaultCountry='BR'] país quando não há + no valor
 * @returns {string}
 */
export function normalizePhoneToE164(value, defaultCountry = 'BR') {
  if (value == null || String(value).trim() === '') return '';
  const s = String(value).trim();
  if (s.startsWith('+')) {
    if (isValidPhoneNumber(s)) return s;
    const parsedIntl = parsePhoneNumber(s);
    return parsedIntl ? parsedIntl.format('E.164') : s;
  }
  const parsed = parsePhoneNumber(s, defaultCountry);
  return parsed ? parsed.format('E.164') : s;
}

export function toPayloadLegacyDigits(raw) {
  const d = onlyDigits(raw);
  if (d.startsWith('55') && (d.length === 12 || d.length === 13)) return d.slice(2);
  return d;
};
