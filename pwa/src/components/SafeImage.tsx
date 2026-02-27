import Image from 'next/image';

type SafeImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholderClassName?: string;
};

function normalizeRemoteImageSrc(src?: string | null): string | null {
  const value = typeof src === 'string' ? src.trim() : '';
  if (!value) {
    return null;
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
  className,
  sizes,
  fill,
  width,
  height,
  priority,
  placeholderClassName,
}: SafeImageProps) {
  const safeSrc = normalizeRemoteImageSrc(src);

  if (!safeSrc) {
    return (
      <div className={placeholderClassName ?? 'flex h-full w-full items-center justify-center bg-slate-100 text-slate-300'}>
        <span className="material-symbols-outlined text-[72px]">image</span>
      </div>
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

