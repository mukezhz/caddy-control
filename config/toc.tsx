type TocPage = {
  title: string;
  href: string;
};

type TocSection = {
  title: string;
  href: string;
  pages?: TocPage[];
};

type TocData = {
  [key: string]: TocSection[];
};

// TOC Data for Caddy Control documentation
export const TocData: TocData = {
  'getting-started/introduction': [
    {
      title: 'Welcome to Caddy Control',
      href: '/docs/getting-started/introduction#welcome-to-caddy-control',
      pages: [
        {
          title: 'Why Choose Caddy Control',
          href: '/docs/getting-started/introduction#why-choose-caddy-control',
        },
        {
          title: 'Features',
          href: '/docs/getting-started/introduction#features',
        },
        {
          title: 'Technologies',
          href: '/docs/getting-started/introduction#technologies-behind-caddy-control',
        },
      ],
    },
  ],
  'getting-started/installation': [
    {
      title: 'Installation Guide',
      href: '/docs/getting-started/installation#installation-guide',
      pages: [
        {
          title: 'Local Development Setup',
          href: '/docs/getting-started/installation#local-development-setup',
        },
        {
          title: 'Production Deployment with Docker',
          href: '/docs/getting-started/installation#production-deployment-with-docker',
        },
        {
          title: 'Verifying Your Installation',
          href: '/docs/getting-started/installation#verifying-your-installation',
        },
      ],
    },
  ],
  'getting-started/quick-start': [
    {
      title: 'Quick Start Guide',
      href: '/docs/getting-started/quick-start#quick-start-guide',
      pages: [
        {
          title: 'Managing Domains',
          href: '/docs/getting-started/quick-start#managing-domains',
        },
        {
          title: 'Next Steps',
          href: '/docs/getting-started/quick-start#next-steps',
        },
      ],
    },
  ],
  'api/overview': [
    {
      title: 'API Overview',
      href: '/docs/api/overview#api-overview',
      pages: [
        {
          title: 'Base URL',
          href: '/docs/api/overview#base-url',
        },
        {
          title: 'Authentication',
          href: '/docs/api/overview#authentication',
        },
        {
          title: 'Response Format',
          href: '/docs/api/overview#response-format',
        },
        {
          title: 'Rate Limiting',
          href: '/docs/api/overview#rate-limiting',
        },
        {
          title: 'Best Practices',
          href: '/docs/api/overview#best-practices',
        },
      ],
    },
  ],
  'api/authentication': [
    {
      title: 'API Authentication',
      href: '/docs/api/authentication#api-authentication',
      pages: [
        {
          title: 'API Key Authentication',
          href: '/docs/api/authentication#api-key-authentication',
        },
        {
          title: 'Managing API Keys',
          href: '/docs/api/authentication#managing-api-keys',
        },
        {
          title: 'Best Practices',
          href: '/docs/api/authentication#best-practices-for-api-key-management',
        },
      ],
    },
  ],
  'api/endpoints': [
    {
      title: 'API Endpoints',
      href: '/docs/api/endpoints#api-endpoints',
      pages: [
        {
          title: 'Domain Management',
          href: '/docs/api/endpoints#domain-management',
        },
        {
          title: 'Caddy Configuration',
          href: '/docs/api/endpoints#caddy-configuration',
        },
        {
          title: 'API Key Management',
          href: '/docs/api/endpoints#api-key-management',
        },
        {
          title: 'Error Codes',
          href: '/docs/api/endpoints#error-codes',
        },
        {
          title: 'Pagination',
          href: '/docs/api/endpoints#pagination',
        },
      ],
    },
  ],
};
