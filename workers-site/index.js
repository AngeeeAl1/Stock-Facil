export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      let pathname = url.pathname;

      // Si acceden a raíz, servir dashboard.html
      if (pathname === '/') {
        pathname = '/dashboard.html';
      }

      // Buscar el archivo en los assets
      const asset = await env.ASSETS.get(pathname.substring(1));
      
      if (asset) {
        return new Response(asset, {
          headers: {
            'Content-Type': pathname.endsWith('.html') ? 'text/html; charset=utf-8' : 
                           pathname.endsWith('.css') ? 'text/css' : 
                           pathname.endsWith('.js') ? 'text/javascript' : 'application/octet-stream'
          }
        });
      }

      return new Response('Not found', { status: 404 });
    } catch (e) {
      console.error(e);
      return new Response('Error: ' + e.message, { status: 500 });
    }
  },
};
