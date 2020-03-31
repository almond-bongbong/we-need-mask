const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const distZipPath = path.join(__dirname, '../dist.zip');
const node_ssh = require('node-ssh');
const ssh = new node_ssh();

const output = fs.createWriteStream(distZipPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', function () {
  console.log( `Success zip ${archive.pointer()} total bytes`);
});

archive.on('error', function(err){
  throw err;
});

archive.pipe(output);
archive.directory('./build', 'build');
archive.file('package.json', { name: 'package.json' });
archive.file('ecosystem.config.js', { name: 'ecosystem.config.js' });
archive.file('.env', { name: '.env' });
archive.file('Dockerfile', { name: 'Dockerfile' });
archive.file('.dockerignore', { name: '.dockerignore' });
archive.finalize();

const sshConfig = {
  host: process.env.SERVER_HOST,
  username: process.env.SERVER_USER,
  privateKey: process.env.SERVER_KEY,
};

const workdir = '/home/ubuntu/we-need-mask';

(async () => {
  try {
    await ssh.connect(sshConfig);
    await ssh.putFile(distZipPath, `${workdir}/dist.zip`);
    await ssh.execCommand(`unzip -o ${workdir}/dist.zip -d /home/ubuntu/we-need-mask/`);
    const nodeVersion = await ssh.execCommand('node --version');
    console.log('STDOUT: ' + nodeVersion.stdout);
    console.log('STDERR: ' + nodeVersion.stderr);

    // const installResult = await ssh.execCommand('cd /home/ubuntu/we-need-mask/ && npm install');
    // console.log('STDOUT: ' + installResult.stdout);
    // console.log('STDERR: ' + installResult.stderr);
    //
    // const reloadResult = await ssh.execCommand('cd /home/ubuntu/we-need-mask/ && npm run server:reload');
    // console.log('STDOUT: ' + reloadResult.stdout);
    // console.log('STDERR: ' + reloadResult.stderr);

    const dockerBuildResult = await ssh.execCommand(`docker build -t cmlee/we-need-mask ${workdir}`);
    console.log('STDOUT: ' + dockerBuildResult.stdout);
    console.log('STDERR: ' + dockerBuildResult.stderr);

    const dockerRunResult = await ssh.execCommand('docker run -d cmlee/we-need-mask');
    console.log('STDOUT: ' + dockerRunResult.stdout);
    console.log('STDERR: ' + dockerRunResult.stderr);

    await ssh.execCommand(`rm -rf ${workdir}/dist.zip`);
    console.info(`Deploy succeeded`);
  } catch (e) {
    console.error('Error!!');
    console.error(e);
  } finally {
    ssh.dispose();
  }
})();
