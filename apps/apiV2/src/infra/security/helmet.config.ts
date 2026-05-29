import type { FastifyHelmetOptions } from '@fastify/helmet';

import type { AppConfigService } from '$infra/app-config';

export const getHelmetConfig = (
  config: AppConfigService,
): FastifyHelmetOptions =>
  config.isProd
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
        crossOriginOpenerPolicy: { policy: 'same-origin' },
        crossOriginResourcePolicy: { policy: 'same-origin' },
        originAgentCluster: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        strictTransportSecurity: {
          maxAge: 60 * 60 * 24 * 365,
          includeSubDomains: true,
          preload: true,
        },
        xFrameOptions: { action: 'deny' },
        xContentTypeOptions: true,
        hidePoweredBy: true,
        dnsPrefetchControl: { allow: false },
        permittedCrossDomainPolicies: { permittedPolicies: 'none' },
      }
    : {
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: false,
        originAgentCluster: false,
        referrerPolicy: false,
        strictTransportSecurity: false,
        xFrameOptions: false,
        xContentTypeOptions: true,
        hidePoweredBy: true,
        dnsPrefetchControl: false,
        permittedCrossDomainPolicies: false,
      };
