#!/usr/bin/env python3
"""v4 integration coverage: two isolated bare remotes, no GitHub writes."""
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import unittest

from deploy_fixture_test import DeploymentFixture,PROJECT
spec=importlib.util.spec_from_file_location('patch_home',PROJECT/'tools/patch_smartaction_home.py')
patch=importlib.util.module_from_spec(spec);spec.loader.exec_module(patch)

class DualDeploymentFixture(DeploymentFixture):
    def setUp(self):
        super().setUp()
        self.remote2=self.root/'taichi.git'
        self.run_command('git','init','--bare','--initial-branch=main',str(self.remote2))
        self.run_command('git','config','--file',str(self.config),'--unset-all','url.'+self.remote.as_uri()+'.insteadOf',r'^https://github\.com/kuonanhong/taichi\.git$')
        self.run_command('git','config','--file',str(self.config),'url.'+self.remote2.as_uri()+'.insteadOf','https://github.com/kuonanhong/taichi.git')
        self.home=b'<!DOCTYPE html>\r\n<html><body><header>Association</header><main>Original text</main></body></html>\n'
        (self.seed/'index.html').write_bytes(self.home)
        self.run_command('git','-C',str(self.seed),'add','index.html')
        self.run_command('git','-C',str(self.seed),'commit','-m','original homepage')
        self.run_command('git','-C',str(self.seed),'push','origin','main')
        shutil.copyfile(PROJECT/'Upload_Both_Sites.sh',self.source/'Upload_Both_Sites.sh')
        (self.source/'tools').mkdir()
        shutil.copyfile(PROJECT/'tools/patch_smartaction_home.py',self.source/'tools/patch_smartaction_home.py')
        (self.source/'tools/download_model.py').write_text('from pathlib import Path\nimport hashlib,json\nr=Path(__file__).resolve().parents[1]/"models"\nfor p in json.loads((r/"manifest.json").read_text())["parts"]:\n assert hashlib.sha256((r/p["file"]).read_bytes()).hexdigest()==p["sha256"]\nprint("FIXTURE MODEL VERIFIED")\n')
        self.add_parts()
    def deploy_both(self,*args,check=True):return self.run_command('bash',str(self.source/'Upload_Both_Sites.sh'),*args,check=check)
    def show2(self,path):return self.run_command('git','--git-dir',str(self.remote2),'show','main:'+path).stdout
    def head2(self):return self.run_command('git','--git-dir',str(self.remote2),'rev-parse','main').stdout.strip()
    def test_dual_default_full_models_empty_target_and_idempotent_home(self):
        result=self.deploy_both()
        self.assertIn('兩站 Git 檔案均已上傳並核對',result.stdout)
        self.assertEqual(self.show('taichi/index.html'),self.show2('index.html'))
        for i,part in enumerate(self.parts,1):
            name='models/qwen-fixture.part%02d'%i
            self.assertEqual(self.show('taichi/'+name),part.decode())
            self.assertEqual(self.show2(name),part.decode())
        home=subprocess.check_output(['git','--git-dir',str(self.remote),'show','main:index.html'],env=self.env)
        self.assertEqual(home,patch.patch_bytes(self.home))
        self.assertEqual(home.count(patch.START),1)
        self.assertIn(b'href="./taichi/"',home)
        self.assertEqual(self.show('other.txt'),'OTHER CONTENTS')
        self.assertEqual(self.show('taichi/keep.txt'),'KEEP REMOTE EXTRA')
        before=(self.head(),self.head2());second=self.deploy_both()
        self.assertEqual(before,(self.head(),self.head2()))
        self.assertIn('內容相同',second.stdout)
        (self.source/'js/app.js').write_text('console.log("updated");\n')
        self.deploy_both('--web-only')
        self.assertEqual(self.show('taichi/js/app.js'),self.show2('js/app.js'))
        self.assertEqual(self.show2('models/qwen-fixture.part01'),self.parts[0].decode())
    def test_both_alias_and_own_cache_reused_then_cleared(self):
        real_git=shutil.which('git');bindir=self.root/'auditbin';bindir.mkdir();audit=self.root/'auth-audit.jsonl'
        wrapper=bindir/'git';wrapper.write_text('#!/usr/bin/env python3\nimport json,os,sys\na=sys.argv[1:]\n# Unix sockets are blocked in the test sandbox; emulate only the cache probe.\nif a and a[0]=="credential-cache":\n if "get" in a: assert "protocol=https" in sys.stdin.read()\n sys.exit(0)\nif "credential.username=kuonanhong" in a:\n with open('+repr(str(audit))+',"a") as f:f.write(json.dumps(a)+"\\n")\nos.execv('+repr(real_git)+','+repr([real_git])+'+a)\n');wrapper.chmod(0o755)
        self.env['PATH']=str(bindir)+':'+self.env['PATH'];before=self.config.read_bytes()
        result=self.deploy('--both','--web-only','--fresh-login')
        self.assertIn('兩站 Git 檔案均已上傳並核對',result.stdout)
        records=[json.loads(row) for row in audit.read_text().splitlines()]
        sockets={arg.split('--socket=',1)[1] for args in records for arg in args if arg.startswith('credential.helper=cache ')}
        self.assertEqual(len(sockets),1)
        for socket in sockets:self.assertFalse(Path(socket).parent.exists())
        self.assertTrue(any('http.https://github.com/kuonanhong/SmartAction.git.extraheader=' in a for a in records))
        self.assertTrue(any('http.https://github.com/kuonanhong/taichi.git.extraheader=' in a for a in records))
        self.assertEqual(before,self.config.read_bytes())
    def test_second_target_rejected_preserves_first_then_resumes(self):
        hook=self.remote2/'hooks/pre-receive';hook.write_text('#!/bin/sh\necho "fixture denial" >&2\nexit 1\n');hook.chmod(0o755)
        result=self.deploy_both('--web-only',check=False)
        self.assertNotEqual(result.returncode,0)
        self.assertIn('双站作業停在：獨立 taichi/',result.stderr)
        self.assertNotIn('兩站 Git 檔案均已上傳並核對',result.stdout)
        first=self.head();self.assertEqual(self.show('taichi/index.html'),(self.source/'index.html').read_text())
        hook.unlink();result=self.deploy_both('--web-only')
        self.assertEqual(first,self.head())
        self.assertIn('兩站 Git 檔案均已上傳並核對',result.stdout)
    def test_web_size_batches_and_oversize_file_guard(self):
        assets=self.source/'assets';assets.mkdir()
        for name,mib in (('a.bin',60),('b.bin',60),('c.bin',30)):
            with (assets/name).open('wb') as f:f.truncate(mib*1024*1024)
        result=self.deploy('--web-only')
        self.assertIn('網站批次 1/2',result.stdout);self.assertIn('網站批次 2/2',result.stdout)
        self.assertIn('2 個網站 push + 0 個模型 push = 2',result.stdout)
        self.assertEqual(self.run_command('git','--git-dir',str(self.remote),'cat-file','-s','main:taichi/assets/a.bin').stdout.strip(),str(60*1024*1024))
        head=self.head()
        with (assets/'oversize.bin').open('wb') as f:f.truncate(97*1024*1024)
        bad=self.deploy('--web-only',check=False)
        self.assertNotEqual(bad.returncode,0);self.assertIn('96 MiB 批次上限',bad.stderr);self.assertEqual(head,self.head())
    def test_missing_home_does_not_invent_one(self):
        self.run_command('git','-C',str(self.seed),'rm','index.html')
        self.run_command('git','-C',str(self.seed),'commit','-m','no home')
        self.run_command('git','-C',str(self.seed),'push','origin','main')
        result=self.deploy('--web-only');self.assertIn('未建立假的協會首頁',result.stdout)
        self.assertNotEqual(self.run_command('git','--git-dir',str(self.remote),'cat-file','-e','main:index.html',check=False).returncode,0)
    def test_v4_public_audio_layout_and_lockfile_both_targets(self):
        expected={
            'js/layout.js':'export const layout="v4";\n',
            'data/audio/manifest.json':'{"voice":"fixture"}\n',
            'assets/audio-natural/zh-TW/opening.mp3':'fixture natural voice bytes',
            'assets/audio/zh-Hant/voice-test.mp3':'fixture fallback voice bytes',
            'styles.css':'body{color:#123}\n',
            'README_ZH.md':'v4 fixture documentation\n',
            'package-lock.json':'{"lockfileVersion":3}\n',
            'docs/UPLOAD_V4_QUICKSTART.txt':'v4 quickstart fixture\n',
        }
        for rel,content in expected.items():
            target=self.source/rel;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(content)
        helper_spec=importlib.util.spec_from_file_location('legacy_prepare',PROJECT/'tools/prepare_deploy.py')
        helper=importlib.util.module_from_spec(helper_spec);helper_spec.loader.exec_module(helper)
        discovered={str(path.relative_to(self.source)) for path in helper.public_files(self.source)}
        self.assertTrue(set(expected)<=discovered)
        result=self.deploy_both('--web-only')
        self.assertIn('SmartAction dual uploader v4.0',result.stdout)
        for rel,content in expected.items():
            self.assertEqual(self.show('taichi/'+rel),content)
            self.assertEqual(self.show2(rel),content)

    def test_conflicting_dual_options_rejected(self):
        before=self.head();result=self.deploy_both('--with-model','--web-only',check=False)
        self.assertNotEqual(result.returncode,0);self.assertEqual(before,self.head())

class HomepagePatch(unittest.TestCase):
    def test_byte_preservation_and_last_body(self):
        original=b'<html>\r\n<body><script>let x="</body>";</script><p>exact</p></BODY></html>'
        expected=original.replace(b'</BODY>',b'\n'+patch.BLOCK+b'\n</BODY>')
        self.assertEqual(patch.patch_bytes(original),expected)
        self.assertEqual(patch.patch_bytes(expected),expected)
    def test_owned_marker_updates_only_owned_content(self):
        old=b'BEFORE\r\n'+patch.START+b'old code'+patch.END+b'\r\nAFTER'
        self.assertEqual(patch.patch_bytes(old),b'BEFORE\r\n'+patch.BLOCK+b'\r\nAFTER')
    def test_broken_markers_and_duplicate_id_are_rejected(self):
        for data in [patch.START+b'noend',patch.END+patch.START,patch.BLOCK+patch.BLOCK,b'<body><a id="smartaction-taichi-entry"></a></body>']:
            with self.assertRaises(ValueError):patch.patch_bytes(data)
    def test_missing_body_not_rewritten(self):self.assertIsNone(patch.patch_bytes(b'OLD HOME TEXT'))
    def test_actual_home_only_owned_block_inserted(self):
        original_path=PROJECT.parents[1]/'taichi_v3_base'/'SmartAction_home_original.html'
        if not original_path.exists():self.skipTest('Original homepage fixture is not included in public package')
        original=original_path.read_bytes();updated=patch.patch_bytes(original)
        self.assertIsNotNone(updated)
        self.assertEqual(updated.replace(b'\n'+patch.BLOCK+b'\n',b'',1),original)
        self.assertEqual(patch.patch_bytes(updated),updated)


def load_tests(loader,standard,pattern):
    suite=unittest.TestSuite()
    for cls in (DualDeploymentFixture,HomepagePatch):
        for name in cls.__dict__:
            if name.startswith('test_'):suite.addTest(cls(name))
    return suite
if __name__=='__main__':unittest.main(verbosity=2)
