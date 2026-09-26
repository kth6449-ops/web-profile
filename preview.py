"""Open the static site with one shared local browser origin."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser


root = Path(__file__).resolve().parent / 'frontend'
handler = partial(SimpleHTTPRequestHandler, directory=str(root))
with ThreadingHTTPServer(('127.0.0.1', 8765), handler) as server:
    url = f'http://127.0.0.1:{server.server_address[1]}/index.html'
    print(f'Opening {url}', flush=True)
    webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
