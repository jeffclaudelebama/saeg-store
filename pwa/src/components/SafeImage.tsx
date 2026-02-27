import Image from 'next/image';

type SafeImageProps = {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
};

function normalizeImageSrc(src?: string | null): string | null {
  const value = typeof src === 'string' ? src.trim() : '';
  if (!value) {
    return null;
  }

  if (value.startsWith('/') && !value.startsWith('//')) {
    return value;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return encodeURI(value);
  } catch {
    return null;
  }
}

export function SafeImage({
  src,
  alt,
  fallbackSrc = '/img/placeholder-produit.png',
  className,
  sizes,
  fill,
  width,
  height,
  priority,
}: SafeImageProps) {
  const safeSrc = normalizeImageSrc(src);
  const fallback = normalizeImageSrc(fallbackSrc) ?? '/img/placeholder-produit.png';

  if (!safeSrc) {
    if (fill) {
      return (
        <Image
          src={fallback}
          alt={alt}
          fill
          sizes={sizes}
          className={className}
          priority={priority}
        />
      );
    }
    return (
      <Image
        src={fallback}
        alt={alt}
        width={width ?? 1200}
        height={height ?? 1200}
        sizes={sizes}
        className={className}
        priority={priority}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={safeSrc}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={safeSrc}
      alt={alt}
      width={width ?? 1200}
      height={height ?? 1200}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  );
}
