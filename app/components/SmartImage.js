import Image from "next/image";

export default function SmartImage({
  alt = "",
  className = "",
  height = 600,
  sizes = "100vw",
  src,
  width = 800,
  ...props
}) {
  if (!src) return null;

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      unoptimized
      {...props}
    />
  );
}
