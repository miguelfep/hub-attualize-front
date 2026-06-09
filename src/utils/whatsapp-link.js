import { onlyDigits } from './format-number';

export const ATTUALIZE_WHATSAPP_PHONE = '554130681800';

export function buildWhatsAppLink({ phoneNumber = '', message = '' }) {
  const normalizedPhone = onlyDigits(String(phoneNumber));
  const encodedMessage = encodeURIComponent(String(message));

  return `https://api.whatsapp.com/send?phone=${normalizedPhone}&text=${encodedMessage}`;
}
