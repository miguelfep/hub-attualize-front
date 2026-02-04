import { forwardRef } from 'react';
import NextImage from 'next/image';
import { LazyLoadImage } from 'react-lazy-load-image-component';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

import { CONFIG } from 'src/config-global';

import { imageClasses } from './classes';

// ----------------------------------------------------------------------

const ImageWrapper = styled(Box)({
  overflow: 'hidden',
  position: 'relative',
  verticalAlign: 'bottom',
  display: 'inline-block',
  [`& .${imageClasses.wrapper}`]: {
    width: '100%',
    height: '100%',
    verticalAlign: 'bottom',
    backgroundSize: 'cover !important',
  },
});

const Overlay = styled('span')({
  top: 0,
  left: 0,
  zIndex: 1,
  width: '100%',
  height: '100%',
  position: 'absolute',
});

// ----------------------------------------------------------------------

export const Image = forwardRef(
  (
    {
      ratio,
      disabledEffect = false,
      //
      alt,
      src,
      delayTime,
      threshold,
      beforeLoad,
      delayMethod,
      placeholder,
      wrapperProps,
      scrollPosition,
      effect = 'blur',
      visibleByDefault,
      wrapperClassName,
      useIntersectionObserver,
      //
      // Novas props para otimização com next/image
      useNextImage = false,
      priority = false,
      fetchPriority,
      quality,
      sizes,
      //
      slotProps,
      sx,
      ...other
    },
    ref
  ) => {
    // Verifica se deve usar next/image (quando useNextImage=true ou quando src é local e não tem efeitos especiais)
    const shouldUseNextImage =
      useNextImage ||
      (src &&
        !src.startsWith('http') &&
        !src.startsWith('//') &&
        !disabledEffect &&
        !visibleByDefault &&
        !delayTime &&
        !threshold);

    // Se usar next/image, renderiza versão otimizada
    if (shouldUseNextImage) {
      return (
        <ImageWrapper
          ref={ref}
          component="span"
          className={imageClasses.root}
          sx={{
            ...(!!ratio && { width: 1, position: 'relative', aspectRatio: ratio }),
            ...sx,
          }}
          {...other}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              ...(ratio && { aspectRatio: ratio }),
            }}
          >
            <NextImage
              src={src}
              alt={alt || ''}
              fill
              priority={priority}
              fetchPriority={fetchPriority}
              quality={quality || 85}
              sizes={sizes || '100vw'}
              style={{
                objectFit: 'cover',
                ...(ratio && { aspectRatio: ratio }),
              }}
            />
          </Box>
          {slotProps?.overlay && <Overlay className={imageClasses.overlay} sx={slotProps?.overlay} />}
        </ImageWrapper>
      );
    }

    // Fallback para componente original com lazy loading
    const content = (
      <Box
        component={LazyLoadImage}
        alt={alt}
        src={src}
        delayTime={delayTime}
        threshold={threshold}
        beforeLoad={beforeLoad}
        delayMethod={delayMethod}
        placeholder={placeholder}
        wrapperProps={wrapperProps}
        scrollPosition={scrollPosition}
        visibleByDefault={visibleByDefault}
        effect={visibleByDefault || disabledEffect ? undefined : effect}
        useIntersectionObserver={useIntersectionObserver}
        wrapperClassName={wrapperClassName || imageClasses.wrapper}
        placeholderSrc={
          visibleByDefault || disabledEffect
            ? `${CONFIG.site.basePath}/assets/transparent.png`
            : `${CONFIG.site.basePath}/assets/placeholder.svg`
        }
        sx={{
          width: 1,
          height: 1,
          objectFit: 'cover',
          verticalAlign: 'bottom',
          aspectRatio: ratio,
        }}
      />
    );

    return (
      <ImageWrapper
        ref={ref}
        component="span"
        className={imageClasses.root}
        sx={{ ...(!!ratio && { width: 1 }), ...sx }}
        {...other}
      >
        {slotProps?.overlay && <Overlay className={imageClasses.overlay} sx={slotProps?.overlay} />}

        {content}
      </ImageWrapper>
    );
  }
);
