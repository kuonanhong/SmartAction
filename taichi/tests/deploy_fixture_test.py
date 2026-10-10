#!/usr/bin/env python3
"""Local bare-Git integration test; all GitHub URLs are rewritten to a temp local repo.
No network push, real credentials, browser, or GitHub mutation is performed.
"""
import hashlib
import json
import os
import shlex
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

PROJECT=Path(__file__).resolve().parents[1]

class DeploymentFixture(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(prefix='smartaction-deploy-test-')
        self.root=Path(self.temp.name)
        self.source=self.root/'game with spaces'
        self.source.mkdir()
        self.remote=self.root/'remote.git'
        self.seed=self.root/'seed'
        self.config=self.root/'gitconfig'
        self.env=dict(os.environ,GIT_CONFIG_GLOBAL=str(self.config),GIT_CONFIG_NOSYSTEM='1',GIT_TERMINAL_PROMPT='0')
        self.env.pop('GIT_CONFIG_COUNT',None)
        self.run_command('git','config','--file',str(self.config),'user.name','Fixture Tester')
        self.run_command('git','config','--file',str(self.config),'user.email','fixture@example.invalid')
        self.run_command('git','config','--file',str(self.config),'credential.helper','')
        # Any inherited LFS filtering would fail; the nested -filter must override it.
        self.run_command('git','config','--file',str(self.config),'filter.invalid-lfs.clean','false')
        self.run_command('git','config','--file',str(self.config),'filter.invalid-lfs.required','true')
        self.run_command('git','config','--file',str(self.config),'url.'+self.remote.as_uri()+'.insteadOf','https://github.com/kuonanhong/SmartAction.git')
        self.run_command('git','config','--file',str(self.config),'--add','url.'+self.remote.as_uri()+'.insteadOf','https://github.com/kuonanhong/taichi.git')
        self.run_command('git','init','--bare','--initial-branch=main',str(self.remote))
        self.run_command('git','init','--initial-branch=main',str(self.seed))
        (self.seed/'index.html').write_text('EXISTING ASSOCIATION HOMEPAGE')
        (self.seed/'.nojekyll').write_text('PRESERVE CONTENTS')
        (self.seed/'other.txt').write_text('OTHER CONTENTS')
        (self.seed/'.gitattributes').write_text('*.part* filter=invalid-lfs\n*.js text eol=crlf\n')
        (self.seed/'.gitignore').write_text('taichi/models/\n')
        (self.seed/'taichi').mkdir()
        (self.seed/'taichi/keep.txt').write_text('KEEP REMOTE EXTRA')
        self.run_command('git','-C',str(self.seed),'add','.')
        self.run_command('git','-C',str(self.seed),'commit','-m','seed')
        self.run_command('git','-C',str(self.seed),'remote','add','origin',str(self.remote))
        self.run_command('git','-C',str(self.seed),'push','origin','main')
        shutil.copyfile(PROJECT/'Upload_SmartAction.sh',self.source/'Upload_SmartAction.sh')
        (self.source/'index.html').write_text('<!doctype html><script src="js/app.js"></script>')
        (self.source/'js').mkdir()
        (self.source/'js/app.js').write_bytes(b'console.log("fixture");\n')
        (self.source/'models').mkdir()
        self.parts=[b'first-part'*101,b'second-part'*102,b'third-part'*103,b'fourth-part'*104,b'last-part'*105]
        manifest={'bytes':sum(map(len,self.parts)),'sha256':hashlib.sha256(b''.join(self.parts)).hexdigest(),'parts':[]}
        for i,data in enumerate(self.parts,1):
            manifest['parts'].append({'file':'qwen-fixture.part%02d'%i,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
        (self.source/'models/manifest.json').write_text(json.dumps(manifest))
    def tearDown(self): self.temp.cleanup()
    def run_command(self,*args,check=True):
        r=subprocess.run(args,env=self.env,cwd=self.root,text=True,capture_output=True)
        if check and r.returncode: raise AssertionError('Command failed: '+repr(args)+'\n'+r.stdout+r.stderr)
        return r
    def deploy(self,*args,check=True): return self.run_command('bash',str(self.source/'Upload_SmartAction.sh'),*args,check=check)
    def show(self,name): return self.run_command('git','--git-dir',str(self.remote),'show','main:'+name).stdout
    def head(self): return self.run_command('git','--git-dir',str(self.remote),'rev-parse','main').stdout.strip()
    def add_parts(self):
        for i,data in enumerate(self.parts,1): (self.source/('models/qwen-fixture.part%02d'%i)).write_bytes(data)
    def assert_preserved(self):
        self.assertEqual(self.show('index.html'),'EXISTING ASSOCIATION HOMEPAGE')
        self.assertEqual(self.show('.nojekyll'),'PRESERVE CONTENTS')
        self.assertEqual(self.show('other.txt'),'OTHER CONTENTS')
        self.assertEqual(self.show('taichi/keep.txt'),'KEEP REMOTE EXTRA')
    def test_web_noop_and_preservation(self):
        first=self.deploy()
        self.assertIn('沒有上傳模型權重',first.stdout)
        self.assertEqual(self.show('taichi/js/app.js'),'console.log("fixture");\n')
        self.assert_preserved()
        previous=self.head(); second=self.deploy()
        self.assertEqual(previous,self.head())
        self.assertIn('內容相同',second.stdout)
        (self.source/'styles.css').write_text('body{color:green}')
        self.deploy(); self.assertNotEqual(previous,self.head())
        self.assertEqual(self.show('taichi/styles.css'),'body{color:green}')
        self.assert_preserved()
    def test_parts_resume_after_rejection(self):
        self.add_parts()
        flag=self.remote/'reject-once';flag.touch()
        hook=self.remote/'hooks/pre-receive'
        hook.write_text('#!/bin/sh\nwhile read old new ref; do\n  subject=$(git log -1 --format=%s "$new")\n  case "$subject" in\n    *part03*) if [ -f reject-once ]; then rm reject-once; echo "fixture simulated disconnect" >&2; exit 1; fi ;;\n  esac\ndone\n')
        hook.chmod(0o755)
        failed=self.deploy(check=False)
        self.assertNotEqual(failed.returncode,0)
        self.assertIn('上傳未完成',failed.stderr)
        self.assertEqual(self.show('taichi/models/qwen-fixture.part01'),self.parts[0].decode())
        self.assertEqual(self.show('taichi/models/qwen-fixture.part02'),self.parts[1].decode())
        absent=self.run_command('git','--git-dir',str(self.remote),'cat-file','-e','main:taichi/models/qwen-fixture.part03',check=False)
        self.assertNotEqual(absent.returncode,0)
        resumed=self.deploy()
        self.assertIn('內容相同',resumed.stdout)
        for i,data in enumerate(self.parts,1): self.assertEqual(self.show('taichi/models/qwen-fixture.part%02d'%i),data.decode())
        subjects=self.run_command('git','--git-dir',str(self.remote),'log','--format=%s','main').stdout
        self.assertEqual(subjects.count('Add SmartAction model segments qwen-fixture.part01 + qwen-fixture.part02'),1)
        self.assertEqual(subjects.count('Add SmartAction model segments '),3)
        previous=self.head();self.deploy();self.assertEqual(previous,self.head())
        self.assert_preserved()
    def test_partial_model_and_web_only(self):
        (self.source/'models/qwen-fixture.part01').write_bytes(self.parts[0])
        previous=self.head(); failed=self.deploy(check=False)
        self.assertNotEqual(failed.returncode,0); self.assertEqual(previous,self.head())
        self.assertIn('分片不完整',failed.stderr)
        self.deploy('--web-only');self.assertNotEqual(previous,self.head())
    def test_bad_hash_and_argument_rejection(self):
        self.add_parts();(self.source/'models/qwen-fixture.part02').write_bytes(b'bad')
        previous=self.head();failed=self.deploy(check=False)
        self.assertNotEqual(failed.returncode,0);self.assertEqual(previous,self.head())
        for args in [('--folder','../escape'),('--repo','https://fake-token@github.com/kuonanhong/SmartAction.git'),('--with-model','--web-only')]:
            result=self.deploy(*args,check=False);self.assertNotEqual(result.returncode,0)
            self.assertNotIn('fake-token',result.stdout+result.stderr)
        self.assertEqual(previous,self.head())
    def test_source_symlink_and_oversize_rejected(self):
        (self.source/'js/app.js').unlink()
        (self.source/'js/app.js').symlink_to(self.seed/'other.txt')
        previous=self.head();r=self.deploy(check=False)
        self.assertNotEqual(r.returncode,0);self.assertIn('符號連結',r.stderr);self.assertEqual(previous,self.head())
        (self.source/'js/app.js').unlink()
        with (self.source/'js/app.js').open('wb') as f: f.truncate(100*1024*1024)
        r=self.deploy(check=False)
        self.assertNotEqual(r.returncode,0);self.assertIn('100 MiB',r.stderr);self.assertEqual(previous,self.head())

    def test_standalone_root_and_fresh_credentials(self):
        self.add_parts()
        real_git=shutil.which('git')
        bindir=self.root/'fresh-bin'; bindir.mkdir()
        audit=self.root/'fresh-audit.jsonl'
        wrapper=bindir/'git'
        wrapper.write_text('#!/usr/bin/env python3\nimport json,os,sys\nargs=sys.argv[1:]\nif "credential.username=kuonanhong" in args:\n record={"askpass_present":any(k in os.environ for k in ("GIT_ASKPASS","SSH_ASKPASS")),"args":args}\n with open('+repr(str(audit))+',"a") as f:f.write(json.dumps(record)+"\\n")\nos.execv('+repr(real_git)+','+repr([real_git])+'+args)\n')
        wrapper.chmod(0o755)
        self.env['PATH']=str(bindir)+os.pathsep+self.env['PATH']
        self.env['GIT_ASKPASS']='/not/a/real/askpass'
        self.env['SSH_ASKPASS']='/not/a/real/askpass'
        config_before=self.config.read_bytes()
        result=self.deploy('--site','taichi','--fresh-login')
        self.assertEqual(self.show('index.html'),(self.source/'index.html').read_text())
        self.assertEqual(self.show('js/app.js'),'console.log("fixture");\n')
        self.assertEqual(self.show('other.txt'),'OTHER CONTENTS')
        self.assertEqual(self.show('taichi/keep.txt'),'KEEP REMOTE EXTRA')
        self.assertEqual(self.show('models/qwen-fixture.part05'),self.parts[4].decode())
        self.assertIn('https://kuonanhong.github.io/taichi/',result.stdout)
        self.assertNotIn('https://kuonanhong.github.io/taichi/taichi/',result.stdout)
        self.assertEqual(config_before,self.config.read_bytes())
        records=[json.loads(line) for line in audit.read_text().splitlines()]
        self.assertTrue(records)
        for record in records:
            self.assertFalse(record['askpass_present'])
            self.assertIn('core.askPass=',record['args'])
            self.assertIn('http.https://github.com/kuonanhong/taichi.git.extraheader=',record['args'])
            for argument in record['args']:
                if argument.startswith('credential.helper=cache '):
                    socket=Path(argument.split('--socket=',1)[1])
                    self.assertFalse(socket.parent.exists(),'credential cache directory must be removed')
        absent=self.run_command('git','--git-dir',str(self.remote),'cat-file','-e','main:taichi/index.html',check=False)
        self.assertNotEqual(absent.returncode,0)
        previous=self.head(); self.deploy('--site','taichi','--fresh-login')
        self.assertEqual(previous,self.head())

    def test_smartaction_root_is_guarded(self):
        previous=self.head(); result=self.deploy('--folder','.',check=False)
        self.assertNotEqual(result.returncode,0)
        self.assertIn('避免覆寫協會首頁',result.stderr)
        self.assertEqual(previous,self.head())

    def test_preflight_denial_stops_before_download_or_push(self):
        real_git=shutil.which('git')
        bindir=self.root/'fake-bin'; bindir.mkdir()
        wrapper=bindir/'git'
        wrapper.write_text('#!/bin/sh\nfor arg do\n if [ "$arg" = "--dry-run" ]; then\n  echo "fixture HTTP 403 permission denied" >&2; exit 1\n fi\ndone\nexec '+shlex.quote(real_git)+' "$@"\n')
        wrapper.chmod(0o755)
        self.env['PATH']=str(bindir)+os.pathsep+self.env['PATH']
        previous=self.head(); result=self.deploy('--with-model',check=False)
        self.assertNotEqual(result.returncode,0)
        self.assertIn('寫入預檢失敗',result.stderr)
        self.assertNotIn('缺少 tools/download_model.py',result.stderr)
        self.assertEqual(previous,self.head())

    def test_import_sibling_parts_preserves_pose(self):
        donor=self.root/'SmartAction_Qwen3_CPU_Weights'/'models'; donor.mkdir(parents=True)
        for i,data in enumerate(self.parts,1): (donor/('qwen-fixture.part%02d'%i)).write_bytes(data)
        # A damaged destination is repaired from a verified sibling part.
        (self.source/'models/qwen-fixture.part02').write_bytes(b'bad')
        pose=self.source/'models/pose'; pose.mkdir()
        (pose/'fixture.task').write_bytes(b'body-model-preserved')
        tools=self.source/'tools'; tools.mkdir()
        (tools/'download_model.py').write_text('from pathlib import Path\nimport hashlib,json\nr=Path(__file__).resolve().parents[1]/"models"\nfor p in json.loads((r/"manifest.json").read_text())["parts"]:\n assert hashlib.sha256((r/p["file"]).read_bytes()).hexdigest()==p["sha256"]\nprint("FIXTURE VERIFIED; NO NETWORK DOWNLOAD")\n')
        result=self.deploy('--with-model')
        self.assertIn('FIXTURE VERIFIED; NO NETWORK DOWNLOAD',result.stdout)
        self.assertIn('合併有效分片： 5',result.stdout)
        self.assertEqual((pose/'fixture.task').read_bytes(),b'body-model-preserved')
        self.assertEqual(self.show('taichi/models/pose/fixture.task'),'body-model-preserved')
        for i,data in enumerate(self.parts,1):
            self.assertEqual((donor/('qwen-fixture.part%02d'%i)).read_bytes(),data)
            self.assertEqual(self.show('taichi/models/qwen-fixture.part%02d'%i),data.decode())

    def test_model_directory_symlink_rejected_before_import(self):
        donor=self.root/'outside-models'
        (self.source/'models').rename(donor)
        (self.source/'models').symlink_to(donor,target_is_directory=True)
        previous=self.head(); result=self.deploy('--with-model',check=False)
        self.assertNotEqual(result.returncode,0)
        self.assertIn('來源 models 不可為符號連結',result.stderr)
        self.assertNotIn('[1/4]',result.stdout)
        self.assertEqual(previous,self.head())

if __name__=='__main__': unittest.main(verbosity=2)
