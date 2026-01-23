import { FastifyHelmetOptions } from '@fastify/helmet';

export const getHelmetConfig = (isProd: boolean): FastifyHelmetOptions =>
  isProd
    ? {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
            scriptSrc: ["'self'", 'https:', "'unsafe-inline'"],
            fontSrc: ["'self'", 'https:', 'data:'],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https:'],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: [],
          },
        },
        crossOriginEmbedderPolicy: true,
        crossOriginResourcePolicy: { policy: 'same-origin' },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        strictTransportSecurity: {
          maxAge: 60 * 60 * 24 * 365,
          includeSubDomains: true,
          preload: true,
        },
        xFrameOptions: { action: 'deny' },
        xXssProtection: true,
        xContentTypeOptions: true,
        hidePoweredBy: true,
        dnsPrefetchControl: { allow: false },
        permittedCrossDomainPolicies: { permittedPolicies: 'none' },
      }
    : {
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: false,
        referrerPolicy: false,
        strictTransportSecurity: false,
        xFrameOptions: false,
        xXssProtection: false,
        xContentTypeOptions: true,
        hidePoweredBy: true,
        dnsPrefetchControl: false,
        permittedCrossDomainPolicies: false,
      };
