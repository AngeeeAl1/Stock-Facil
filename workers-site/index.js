import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';
import manifestJSON from '__STATIC_CONTENT_MANIFEST';

const assetManifest = JSON.parse(manifestJSON);
const ASSET_NAMESPACE = '__STATIC_CONTENT';
const ASSET_MANIFEST = assetManifest;

export default {
  fetch: async (request, env) => {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // Si la ruta es raíz, servir dashboard.html
      if (pathname === '/') {
        const assetKey = mapRequestToAsset(
          new Request('https://example.com/dashboard.html')
        ).url.replace('https://example.com', '');
        
        return env.ASSETS.get(assetKey) || new Response('Not found', { status: 404 });
      }

      const asset = await getAssetFromKV(
        {
          request,
          waitUntil: () => {},
        },
        {
          ASSET_NAMESPACE,
          ASSET_MANIFEST,
        }
      );

      return asset;
    } catch (e) {
      return new Response('Not found', { status: 404 });
    }
  },
};
