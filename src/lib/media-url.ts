export class MediaUrlValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaUrlValidationError";
  }
}

export function normalizePublicMediaUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) throw new MediaUrlValidationError("请提供媒体链接。");
  if (trimmed.length > 2048) throw new MediaUrlValidationError("媒体链接过长。");
  const withProtocol = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    throw new MediaUrlValidationError("请提供有效的媒体链接。");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new MediaUrlValidationError("仅支持 HTTP 和 HTTPS 媒体链接。");
  }
  if (parsed.username || parsed.password) throw new MediaUrlValidationError("媒体链接不能包含用户凭据。");
  if (!isPublicHostname(parsed.hostname)) throw new MediaUrlValidationError("请提供包含有效公开主机名的媒体链接。");
  return parsed.toString();
}

function isPublicHostname(hostname: string) {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (!host || host.length > 253 || host.includes(":")) return false;
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".lan")) {
    return false;
  }

  const ipv4 = parseIpv4(host);
  if (ipv4) return isPublicIpv4(ipv4);
  if (!host.includes(".")) return false;
  return host.split(".").every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label));
}

function parseIpv4(host: string) {
  const parts = host.split(".");
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part))) return null;
  const octets = parts.map(Number);
  return octets.every((octet) => octet >= 0 && octet <= 255) ? octets : null;
}

function isPublicIpv4([first, second]: number[]) {
  if (first === 0 || first === 10 || first === 127 || first >= 224) return false;
  if (first === 100 && second >= 64 && second <= 127) return false;
  if (first === 169 && second === 254) return false;
  if (first === 172 && second >= 16 && second <= 31) return false;
  if (first === 192 && second === 168) return false;
  if (first === 198 && (second === 18 || second === 19)) return false;
  return true;
}
