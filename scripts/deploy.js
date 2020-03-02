const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const SSH2Promise = require('ssh2-promise');
const distZipPath = path.join(__dirname, '../dist.zip');
const node_ssh = require('node-ssh')
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
archive.finalize();

const sshConfig = {
  host: process.env.SERVER_HOST,
  username: process.env.SERVER_USER,
  privateKey: process.env.SERVER_KEY,
};

(async () => {
  try {
    await ssh.connect(sshConfig);
    await ssh.putFile(distZipPath, '/home/ubuntu/we-need-mask/dist.zip');
    await ssh.execCommand('unzip -o /home/ubuntu/we-need-mask/dist.zip -d /home/ubuntu/we-need-mask/');
    const nodeVersion = await ssh.execCommand('node --version');
    console.log('STDOUT: ' + nodeVersion.stdout);
    console.log('STDERR: ' + nodeVersion.stderr);

    const installResult = await ssh.execCommand('cd /home/ubuntu/we-need-mask/ && npm install');
    console.log('STDOUT: ' + installResult.stdout);
    console.log('STDERR: ' + installResult.stderr);

    const reloadResult = await ssh.execCommand('cd /home/ubuntu/we-need-mask/ && npm run server:reload');
    console.log('STDOUT: ' + reloadResult.stdout);
    console.log('STDERR: ' + reloadResult.stderr);

    await ssh.execCommand('rm -rf /home/ubuntu/we-need-mask/dist.zip');
    console.info(`Deploy succeeded`);
  } catch (e) {
    console.error('Error!!');
    console.error(e);
  } finally {
    ssh.dispose();
  }
})();

// const ssh = new SSH2Promise(sshConfig);
// const sftp = ssh.sftp();

// (async function() {
//   try {
//     await sftp.fastPut(distZipPath, '/home/ubuntu/we-need-mask/dist.zip');
//     console.info('File uploaded');
//
//     await ssh.exec('unzip -o /home/ubuntu/we-need-mask/dist.zip -d /home/ubuntu/we-need-mask/');
//     await ssh.exec('set -i && source ~/.bashrc && npm install --prefix ~/we-need-mask');
//     console.info('Install success');
//     await ssh.exec('source ~/.bashrc && npm run server:reload');
//     console.info('Start pm2');
//
//     await ssh.exec(`rm -rf /home/ubuntu/we-need-mask/dist.zip`);
//     console.info(`Deploy succeeded!`);
//   } catch (e) {
//     console.error('Error!');
//     console.error(bin2String(e));
//   } finally {
//     // await ssh.close();
//   }
// })();

function bin2String(array) {
  return String.fromCharCode.apply(String, array);
}