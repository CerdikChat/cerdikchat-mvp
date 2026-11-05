export const MAX_INBOX_ITEMS = 50;

export function assertInboxCapacity(inbox) {
  if (!Array.isArray(inbox)) {
    throw new TypeError("Inbox sesi tidak valid.");
  }
  if (inbox.length >= MAX_INBOX_ITEMS) {
    throw new Error("Batas 50 tugas per tab tercapai. Buka tab baru untuk memulai sesi Inbox baru.");
  }
}
