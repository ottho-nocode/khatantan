import * as React from "react";

export interface ImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  /**
   * Source image URL or path
   */
  src: string;
  /**
   * Alt text for accessibility
   */
  alt: string;
  /**
   * Image width in pixels
   */
  width?: number;
  /**
   * Image height in pixels
   */
  height?: number;
  /**
   * Image quality (1-100). Default: 85
   */
  quality?: number;
  /**
   * Image format. Default: 'auto' (browser chooses best)
   */
  format?: "auto" | "webp" | "avif" | "jpeg" | "png";
  /**
   * How the image should be resized. Default: 'scale-down'
   */
  fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
  /**
   * Gravity for cropping (when using fit=crop). Default: 'auto'
   */
  gravity?: "auto" | "face" | "center" | "top" | "bottom" | "left" | "right";
  /**
   * Device pixel ratio. Default: 1
   */
  dpr?: number;
  /**
   * Background color for transparent images or fit=pad
   */
  backgroundColor?: string;
  /**
   * Blur radius (1-250)
   */
  blur?: number;
  /**
   * Brightness factor (0.1-2.0)
   */
  brightness?: number;
  /**
   * Contrast factor (0.1-2.0)
   */
  contrast?: number;
  /**
   * Saturation factor (0-2.0)
   */
  saturation?: number;
  /**
   * Sharpening strength (0-10)
   */
  sharpen?: number;
  /**
   * Rotation angle (90, 180, 270)
   */
  rotate?: 90 | 180 | 270;
  /**
   * Whether to preserve animation frames. Default: true
   */
  anim?: boolean;
  /**
   * Enable lazy loading. Default: true
   */
  lazy?: boolean;
  /**
   * Quality for slow connections (1-100)
   */
  slowConnectionQuality?: number;
  /**
   * Custom Cloudflare Image options string
   */
  customOptions?: string;
  /**
   * Disable Cloudflare transformation (use original src)
   */
  disableTransform?: boolean;
  /**
   * Responsive image sizes for srcset
   */
  sizes?: string;
  /**
   * Generate responsive srcset with these widths
   */
  responsiveWidths?: number[];
}

/**
 * Checks if we're running in a development environment (localhost)
 *
 * In development, Cloudflare Image Transformation won't work since it requires
 * a Cloudflare-enabled domain. This function detects local development and
 * returns the original image sources instead of transformed URLs.
 */
function isDevelopment(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "0.0.0.0" ||
    window.location.hostname.startsWith("192.168.") ||
    window.location.hostname.includes("ngrok") ||
    window.location.port !== ""
  );
}

function isAvifFile(src: string): boolean {
  return src.toLowerCase().includes(".avif");
}

/**
 * Builds Cloudflare Image Transformation URL
 */
function buildCloudflareImageUrl(
  src: string,
  options: Omit<
    ImageProps,
    | "src"
    | "alt"
    | "className"
    | "style"
    | "lazy"
    | "sizes"
    | "responsiveWidths"
    | "disableTransform"
    | "customOptions"
  > & { customOptions?: string },
): string {
  // If we're in development, return the original src
  if (isDevelopment()) {
    return src;
  }

  // If it's an AVIF file, return original src (Cloudflare doesn't support AVIF transformation)
  if (isAvifFile(src)) {
    return src;
  }

  // If it's already a Cloudflare transform URL, return as-is
  if (src.includes("/cdn-cgi/image/")) {
    return src;
  }

  const params: string[] = [];

  if (options.width) params.push(`width=${options.width}`);
  if (options.height) params.push(`height=${options.height}`);
  if (options.quality) params.push(`quality=${options.quality}`);
  if (options.format && options.format !== "auto")
    params.push(`format=${options.format}`);
  if (options.fit && options.fit !== "scale-down")
    params.push(`fit=${options.fit}`);
  if (options.gravity && options.gravity !== "auto")
    params.push(`gravity=${options.gravity}`);
  if (options.dpr && options.dpr !== 1) params.push(`dpr=${options.dpr}`);
  if (options.backgroundColor) {
    const encodedColor = encodeURIComponent(options.backgroundColor);
    params.push(`background=${encodedColor}`);
  }
  if (options.blur) params.push(`blur=${options.blur}`);
  if (options.brightness && options.brightness !== 1.0)
    params.push(`brightness=${options.brightness}`);
  if (options.contrast && options.contrast !== 1.0)
    params.push(`contrast=${options.contrast}`);
  if (options.saturation && options.saturation !== 1.0)
    params.push(`saturation=${options.saturation}`);
  if (options.sharpen) params.push(`sharpen=${options.sharpen}`);
  if (options.rotate) params.push(`rotate=${options.rotate}`);
  if (options.anim === false) params.push(`anim=false`);
  if (options.slowConnectionQuality)
    params.push(`slow-connection-quality=${options.slowConnectionQuality}`);

  // Add custom options if provided
  if (options.customOptions) {
    params.push(options.customOptions);
  }

  // Always include format=auto so Cloudflare can serve WebP/AVIF based on browser support
  if (!params.some((p) => p.startsWith("format="))) {
    params.push("format=auto");
  }

  const optionsString = params.join(",");

  // Handle absolute URLs vs relative paths
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return `/cdn-cgi/image/${optionsString}/${src}`;
  } else {
    // Remove leading slash to avoid double slashes
    const cleanSrc = src.startsWith("/") ? src.slice(1) : src;
    return `/cdn-cgi/image/${optionsString}/${cleanSrc}`;
  }
}

/**
 * Generates responsive srcset
 */
function generateSrcSet(
  src: string,
  widths: number[],
  otherOptions: Omit<
    ImageProps,
    | "width"
    | "responsiveWidths"
    | "src"
    | "alt"
    | "className"
    | "style"
    | "lazy"
    | "sizes"
    | "disableTransform"
    | "customOptions"
  > & { customOptions?: string },
): string {
  // In development, just return empty string to use single src
  if (isDevelopment()) {
    return "";
  }

  // Skip responsive srcset for AVIF files
  if (isAvifFile(src)) {
    return "";
  }

  return widths
    .map((width) => {
      const url = buildCloudflareImageUrl(src, { ...otherOptions, width });
      return `${url} ${width}w`;
    })
    .join(", ");
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      className,
      width,
      height,
      quality = 85,
      format = "auto",
      fit = "scale-down",
      gravity = "auto",
      dpr = 1,
      backgroundColor,
      blur,
      brightness,
      contrast,
      saturation,
      sharpen,
      rotate,
      anim = true,
      lazy = true,
      slowConnectionQuality,
      customOptions,
      disableTransform = false,
      sizes,
      responsiveWidths,
      ...props
    },
    ref,
  ) => {
    // If transform is disabled, use original src
    if (disableTransform) {
      return (
        <img
          ref={ref}
          src={src}
          alt={alt}
          className={className}
          width={width}
          height={height}
          loading={lazy ? "lazy" : "eager"}
          {...props}
        />
      );
    }

    const imageOptions = {
      width,
      height,
      quality,
      format,
      fit,
      gravity,
      dpr,
      backgroundColor,
      blur,
      brightness,
      contrast,
      saturation,
      sharpen,
      rotate,
      anim,
      slowConnectionQuality,
      customOptions,
    };

    const transformedSrc = buildCloudflareImageUrl(src, imageOptions);

    // Generate responsive images if widths are provided
    const srcSet = responsiveWidths
      ? generateSrcSet(src, responsiveWidths, imageOptions)
      : undefined;

    return (
      <img
        ref={ref}
        src={transformedSrc}
        srcSet={srcSet || undefined}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={lazy ? "lazy" : "eager"}
        {...props}
      />
    );
  },
);

Image.displayName = "Image";

export { Image };
