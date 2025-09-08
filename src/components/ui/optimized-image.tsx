import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  lazy?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  containerClassName?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc,
  lazy = true,
  quality = 75,
  sizes = '100vw',
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  className,
  containerClassName,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const imageSrc = hasError && fallbackSrc ? fallbackSrc : src;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        containerClassName
      )}
    >
      {/* Placeholder */}
      {(!isLoaded || !isInView) && placeholder === 'blur' && (
        <div
          className={cn(
            'absolute inset-0 bg-muted animate-pulse',
            blurDataURL && 'bg-cover bg-center'
          )}
          style={blurDataURL ? { backgroundImage: `url(${blurDataURL})` } : undefined}
        />
      )}

      {/* Loading skeleton */}
      {!isLoaded && !hasError && isInView && placeholder === 'empty' && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Main image */}
      {isInView && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          sizes={sizes}
          {...props}
        />
      )}

      {/* Error state */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-2xl mb-2">📷</div>
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Utility function to generate optimized image URLs (for CDN integration)
export const getOptimizedImageUrl = (
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
  } = {}
) => {
  // If src is already a full URL, return as is
  if (src.startsWith('http') || src.startsWith('//')) {
    return src;
  }

  // For local images, you would integrate with your CDN here
  // Example for Cloudinary, ImageKit, or similar services:
  const { width, height, quality = 75, format = 'webp' } = options;
  
  // This is a placeholder - integrate with your actual CDN
  let optimizedUrl = src;
  
  // Example CDN URL construction:
  // optimizedUrl = `https://your-cdn.com/image/fetch/w_${width},h_${height},q_${quality},f_${format}/${encodeURIComponent(src)}`;
  
  return optimizedUrl;
};

// Component for responsive images with multiple sources
interface ResponsiveImageProps extends OptimizedImageProps {
  breakpoints?: {
    [key: string]: {
      width: number;
      height?: number;
    };
  };
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  breakpoints = {
    sm: { width: 640 },
    md: { width: 768 },
    lg: { width: 1024 },
    xl: { width: 1280 },
  },
  ...props
}) => {
  const generateSrcSet = () => {
    return Object.entries(breakpoints)
      .map(([key, { width }]) => {
        const optimizedSrc = getOptimizedImageUrl(src, { width });
        return `${optimizedSrc} ${width}w`;
      })
      .join(', ');
  };

  const generateSizes = () => {
    return Object.entries(breakpoints)
      .map(([key, { width }], index, array) => {
        if (index === array.length - 1) return `${width}px`;
        return `(max-width: ${width}px) ${width}px`;
      })
      .join(', ');
  };

  return (
    <OptimizedImage
      {...props}
      src={src}
      alt={alt}
      srcSet={generateSrcSet()}
      sizes={generateSizes()}
    />
  );
};