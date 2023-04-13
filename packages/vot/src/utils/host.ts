/**
 * @file Implementation for resolving local hosts during local development and generate
 * @note Almost all of it is copied and pasted from the main Vite website.
 */

import dns from 'node:dns/promises';
import type { AddressInfo, Server } from 'node:net';
import { CommonServerOptions, ResolvedConfig, ResolvedServerUrls } from 'vite';
import os from 'node:os';

export const loopbackHosts = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  '0000:0000:0000:0000:0000:0000:0000:0001',
]);

export const wildcardHosts = new Set([
  '0.0.0.0',
  '::',
  '0000:0000:0000:0000:0000:0000:0000:0000',
]);

/**
 * Returns resolved localhost address when `dns.lookup` result differs from DNS
 *
 * `dns.lookup` result is same when defaultResultOrder is `verbatim`.
 * Even if defaultResultOrder is `ipv4first`, `dns.lookup` result maybe same.
 * For example, when IPv6 is not supported on that machine/network.
 */
export async function getLocalhostAddressIfDiffersFromDNS(): Promise<
  string | undefined
> {
  const [nodeResult, dnsResult] = await Promise.all([
    dns.lookup('localhost'),
    dns.lookup('localhost', { verbatim: true }),
  ]);
  const isSame =
    nodeResult.family === dnsResult.family &&
    nodeResult.address === dnsResult.address;
  return isSame ? undefined : nodeResult.address;
}

export interface Hostname {
  /** undefined sets the default behaviour of server.listen */
  host: string | undefined;
  /** resolve to localhost when possible */
  name: string;
}

export async function resolveHostname(
  optionsHost: string | boolean | undefined,
): Promise<Hostname> {
  let host: string | undefined;
  if (optionsHost === undefined || optionsHost === false) {
    // Use a secure default
    host = 'localhost';
  } else if (optionsHost === true) {
    // If passed --host in the CLI without arguments
    host = undefined; // undefined typically means 0.0.0.0 or :: (listen on all IPs)
  } else {
    host = optionsHost;
  }

  // Set host name to localhost when possible
  let name = host === undefined || wildcardHosts.has(host) ? 'localhost' : host;

  if (host === 'localhost') {
    // See #8647 for more details.
    const localhostAddr = await getLocalhostAddressIfDiffersFromDNS();
    if (localhostAddr) {
      name = localhostAddr;
    }
  }

  return { host, name };
}

export async function resolveServerUrls(
  server: Server,
  options: CommonServerOptions,
  config: ResolvedConfig & { rawBase?: string },
): Promise<ResolvedServerUrls> {
  const address = server.address();

  const isAddressInfo = (x: any): x is AddressInfo => x?.address;
  if (!isAddressInfo(address)) {
    return { local: [], network: [] };
  }

  const local: string[] = [];
  const network: string[] = [];
  const hostname = await resolveHostname(options.host);
  const protocol = options.https ? 'https' : 'http';
  const port = address.port;
  const base =
    config.rawBase === './' || config.rawBase === '' ? '/' : config.rawBase;

  if (hostname.host && loopbackHosts.has(hostname.host)) {
    let hostnameName = hostname.name;
    // ipv6 host
    if (hostnameName.includes(':')) {
      hostnameName = `[${hostnameName}]`;
    }
    local.push(`${protocol}://${hostnameName}:${port}${base}`);
  } else {
    Object.values(os.networkInterfaces())
      .flatMap((nInterface) => nInterface ?? [])
      .filter(
        (detail) =>
          detail &&
          detail.address &&
          (detail.family === 'IPv4' ||
            // @ts-expect-error Node 18.0 - 18.3 returns number
            detail.family === 4),
      )
      .forEach((detail) => {
        let host = detail.address.replace('127.0.0.1', hostname.name);
        // ipv6 host
        if (host.includes(':')) {
          host = `[${host}]`;
        }
        const url = `${protocol}://${host}:${port}${base}`;
        if (detail.address.includes('127.0.0.1')) {
          local.push(url);
        } else {
          network.push(url);
        }
      });
  }
  return { local, network };
}
