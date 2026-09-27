// Parses pasted recipient lists for certificates and badges.

/** "Name, UID, email" or "Name, email" per line (comma, tab or semicolon separated). */
export function parseRecipients(text: string) {
  const ok: { name: string; uid: string; email: string }[] = [];
  const bad: string[] = [];
  const seen = new Set<string>();
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split(/[,\t;]/).map((p) => p.trim().replace(/^"|"$/g, "")).filter(Boolean);
    const email = parts[parts.length - 1]?.toLowerCase() || "";
    if (parts.length < 2 || parts.length > 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      bad.push(line);
      continue;
    }
    if (seen.has(email)) continue;
    seen.add(email);
    ok.push({ name: parts[0], uid: parts.length === 3 ? parts[1].toUpperCase() : "", email });
  }
  return { ok, bad };
}
