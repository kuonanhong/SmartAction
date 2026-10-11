#!/usr/bin/env python3
"""Restore this fixed licensed-media catalog. Standard Python; FFmpeg only for MP4 regeneration.
Usage: python3 restore_assets.py --catalog places.json --root .
Existing matching files are retained. No Google imagery or arbitrary search results are fetched.
"""
import argparse,hashlib,json,os,shutil,subprocess,tempfile,time,urllib.request
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--catalog',type=Path,default=Path(__file__).with_name('places.json'));p.add_argument('--root',type=Path,default=Path(__file__).parent);args=p.parse_args();root=args.root.resolve();root.mkdir(parents=True,exist_ok=True)
def target(relative):
 t=(root/relative).resolve()
 if not t.is_relative_to(root):raise ValueError('Path outside output root')
 t.parent.mkdir(parents=True,exist_ok=True);return t
def sha(path):
 h=hashlib.sha256()
 with path.open('rb') as f:
  for chunk in iter(lambda:f.read(1024*1024),b''):h.update(chunk)
 return h.hexdigest()
def good(path,expected):return path.is_file() and sha(path)==expected
def download(url,out,expected=None):
 if not url.startswith(('https://upload.wikimedia.org/','https://thumb.wikimedia.org/')):raise ValueError('Only Wikimedia media hosts accepted')
 tmp=out.with_name(out.name+'.download')
 for attempt in range(3):
  try:
   with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'SmartActionParkCatalog/3.0 open-license educational media restoration'}),timeout=60) as r,tmp.open('wb') as f:shutil.copyfileobj(r,f)
   if expected and sha(tmp)!=expected:raise ValueError('Source checksum changed. Review license/media update before replacing manifest.')
   tmp.replace(out);return
  except Exception:
   if tmp.exists():tmp.unlink()
   if attempt==2:raise
   time.sleep(attempt+1)
def run_ffmpeg(*opts):
 if not shutil.which('ffmpeg'):raise RuntimeError('FFmpeg required only to rebuild missing videos. Bundled MP4 files need no FFmpeg to play.')
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y',*opts],check=True)
for place in json.loads(args.catalog.read_text(encoding='utf-8')):
 video=place.get('video');photo=place.get('photo')
 if video:
  v=target(video['path']);pic=target(photo['path'])
  if not good(v,video['sha256']) or not good(pic,photo['sha256']):
   with tempfile.TemporaryDirectory(prefix='smartaction-media-') as d:
    original=Path(d)/'source.webm';download(video['originalUrl'],original,video.get('sourceSha256'))
    run_ffmpeg('-i',str(original),'-t','12','-an','-vf','scale=768:-2,fps=24','-c:v','libx264','-crf','27','-pix_fmt','yuv420p','-movflags','+faststart',str(v))
    run_ffmpeg('-ss','1','-i',str(v),'-frames:v','1',str(pic))
   print('Rebuilt video:',place['id'],'(encoder versions may produce a different binary SHA; review before updating manifest)')
 elif photo:
  f=target(photo['path'])
  if not good(f,photo['sha256']):download(photo['downloadUrl'],f,photo['sha256']);print('Downloaded',place['id'])
print('Restoration completed. Attribution and license links remain in credits.json.')
