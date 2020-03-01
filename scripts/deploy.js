const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const SSH2Promise = require('ssh2-promise');
const distZipPath = path.join(__dirname, '../dist.zip');

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
archive.finalize();

const sshConfig = {
  host: process.env.SERVER_HOST,
  username: process.env.SERVER_USER,
  identity: process.env.SERVER_KEY,
};

const ssh = new SSH2Promise(sshConfig);
const sftp = ssh.sftp();

(async function() {
  try {
    await sftp.fastPut(distZipPath, '/home/ubuntu/we-need-mask/dist.zip');
    console.info('File uploaded');

    await ssh.exec('unzip -o /home/ubuntu/we-need-mask/dist.zip -d /home/ubuntu/we-need-mask/');
    await ssh.exec('set -i && source ~/.bashrc && pm2 reload we-need-mask');
    console.info('Start pm2');

    await ssh.exec(`rm -rf /home/ubuntu/we-need-mask/dist.zip`);
    console.info(`Deploy succeeded!`);
  } catch (e) {
    console.error('Error!');
    console.error(bin2String(e));
  } finally {
    await ssh.close();
  }
})();

function bin2String(array) {
  return String.fromCharCode.apply(String, array);
}