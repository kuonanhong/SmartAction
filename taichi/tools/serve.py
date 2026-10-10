#!/usr/bin/env python3
"""No dependencies. Serves the unmodified package with correct WASM MIME."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
import webbrowser

ROOT = Path(__file__).resolve().parent.parent

class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, '.wasm': 'application/wasm', '.js': 'text/javascript', '.mjs': 'text/javascript', '.part01': 'application/octet-stream'}
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

def main():
    parser = argparse.ArgumentParser(description='Start SmartAction practice locally')
    parser.add_argument('--port', type=int, default=8088)
    parser.add_argument('--no-open', action='store_true')
    args = parser.parse_args()
    try:
        server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    except OSError as error:
        raise SystemExit(f'Port {args.port} unavailable: {error}. Try --port 8090')
    url = f'http://localhost:{args.port}/'
    print(f'聰動太極 / SmartAction: {url}', flush=True)
    print('Keep this window open. Ctrl+C to stop. 請保持此視窗開啟；Ctrl+C 停止。', flush=True)
    if not args.no_open:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == '__main__':
    main()
