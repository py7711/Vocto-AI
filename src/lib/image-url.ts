// 头像等外部图片地址可能来自历史脏数据。只有绝对地址（http(s)://、协议相对 //、根路径 / 或 data:）
// 才是安全的 <img src>；裸值（如 "image"）会被浏览器按当前页面相对解析，进而产生 /<locale>/image 这类 404。
export function safeImageSrc(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^(https?:)?\/\//i.test(trimmed)) return trimmed;
  if (/^data:image\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  return null;
}
