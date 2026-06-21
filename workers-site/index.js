export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      let pathname = url.pathname;

      // Si acceden a raíz, servir dashboard.html
      if (pathname === '/' || pathname === '') {
        pathname = '/dashboard.html';
      }

      // Convertir ruta a nombre de archivo
      const filename = pathname.startsWith('/') ? pathname.slice(1) : pathname;
      
      // Buscar en KV namespace
      const kvNamespace = env.__STATIC_CONTENT;
      if (!kvNamespace) {
        return new Response('KV namespace no configurado', { status: 500 });
      }

      // Buscar archivo con hash (como lo sube wrangler)
      const files = await kvNamespace.list();
      
      // Encontrar archivo que corresponda
      let file = await kvNamespace.get(filename);
      if (!file) {
        // Buscar con pattern
        for (const item of files.keys) {
          if (item.name.includes(filename.split('.')[0])) {
            file = await kvNamespace.get(item.name);
            break;
          }
        }
      }

      if (!file) {
        return new Response('Not found', { status: 404 });
      }

      // Determinar content type
      let contentType = 'application/octet-stream';
      if (pathname.endsWith('.html')) contentType = 'text/html; charset=utf-8';
      else if (pathname.endsWith('.css')) contentType = 'text/css';
      else if (pathname.endsWith('.js')) contentType = 'text/javascript';
      else if (pathname.endsWith('.json')) contentType = 'application/json';
      else if (pathname.endsWith('.svg')) contentType = 'image/svg+xml';
      else if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) contentType = 'image/jpeg';
      else if (pathname.endsWith('.png')) contentType = 'image/png';
      else if (pathname.endsWith('.pdf')) contentType = 'application/pdf';

      return new Response(file, {
        headers: { 'Content-Type': contentType }
      });
    } catch (e) {
      console.error('Worker error:', e);
      return new Response('Error: ' + e.message, { status: 500 });
    }
  }
};
