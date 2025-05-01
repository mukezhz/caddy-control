import type {
  HandlerConfig,
  MainConfig,
  RouteConfig,
  RouteHandlerConfig,
  TransportVersion,
} from "./template-types";

export const getCaddyConfigTemplate = (configuredRoutes: RouteConfig[]) => {
  const caddyConfig: MainConfig = {
    admin: {
      listen: "0.0.0.0:2019",
    },
    apps: {
      http: {
        servers: {
          main: {
            listen: [":80", ":443"],
            automatic_https: {
              disable: false,
            },
            routes: configuredRoutes,
          },
        },
      },
    },
  };
  return caddyConfig;
};

export const getRouteTemplate = (
  incomingAddress: string,
  targetAddress: string,
  upstreamPort = 443,
  enableHttps = true,
  versions?: TransportVersion[]
): RouteConfig => {
  const handler = getHandlerTemplate(
    targetAddress,
    upstreamPort,
    enableHttps,
    versions
  );
  const routeConfig: RouteConfig = {
    match: [
      {
        host: [incomingAddress],
      },
    ],
    handle: [handler],
  };

  return routeConfig;
};

export const getHandlerTemplate = (
  targetAddress: string,
  upstreamPort = 443,
  enableHttps = true,
  versions?: TransportVersion[]
): HandlerConfig => {
  const handlerConfig: HandlerConfig = {
    handler: "reverse_proxy",
    upstreams: [{ dial: `${targetAddress}:${upstreamPort}` }],
    headers: {
      request: {
        set: {
          Host: ["{http.reverse_proxy.upstream.hostport}"],
          "X-Origin-Host": ["{http.reverse_proxy.upstream.host}"],
          "X-Origin-IP": ["{http.reverse-proxy.upstream.address}"],
        },
      },
    },
    transport: {
      protocol: "http",
    },
  };
  if (versions?.length && handlerConfig.transport) {
    handlerConfig.transport.versions = versions;
  }

  if (!enableHttps) {
    delete handlerConfig?.transport?.tls;
  }

  return handlerConfig;
};

export const getRouteHandlerTemplate = (
  targetAddress: string,
  upstreamPort = 443,
  enableHttps = true
): RouteHandlerConfig => {
  const handlerConfig: HandlerConfig = {
    handler: "reverse_proxy",
    upstreams: [{ dial: `${targetAddress}:${upstreamPort}` }],
    headers: {
      request: {
        set: {
          Host: ["{http.reverse_proxy.upstream.hostport}"],
          "X-Origin-Host": ["{http.reverse_proxy.upstream.host}"],
          "X-Origin-IP": ["{http.reverse-proxy.upstream.address}"],
        },
      },
    },
    transport: {
      protocol: "http",
    },
  };

  if (!enableHttps) {
    delete handlerConfig?.transport?.tls;
  }

  return {
    handler: "subroute",
    routes: [
      {
        handle: [handlerConfig],
      },
    ],
  };
};

export const getRedirectTemplate = (
  fromDomain: string,
  toDomain: string,
  enableHttps = true
): RouteConfig => {
  const protocol = enableHttps ? "https" : "http";
  const routeConfig: RouteConfig = {
    match: [
      {
        host: [fromDomain],
      },
    ],
    handle: [
      {
        handler: "subroute",
        routes: [
          {
            handle: [
              {
                handler: "static_response",
                headers: {
                  Location: [`${protocol}://${toDomain}{http.request.uri}`],
                },
                status_code: 301,
              },
            ],
          },
        ],
      },
    ],
  };

  return routeConfig;
};
