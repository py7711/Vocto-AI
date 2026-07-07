type BrandLogoProps = {
  alt?: string;
  className?: string;
  height?: number;
  loading?: "eager" | "lazy";
  width?: number;
};

export function BrandLogo({alt = "UniScribe Logo", className = "", height = 45, loading = "eager", width = 180}: BrandLogoProps) {
  const lightClassName = className ? `${className} dark:hidden` : "dark:hidden";
  const darkClassName = className ? `hidden ${className} dark:block` : "hidden dark:block";

  return (
    <>
      <img src="/uniscribe-logo.svg" alt={alt} width={width} height={height} loading={loading} className={lightClassName} />
      <img src="/uniscribe-logo-dark.svg" alt={alt} width={width} height={height} loading={loading} className={darkClassName} />
    </>
  );
}
