#!/usr/bin/env node
const program = require('commander');
const out = require('cli-output');
const pkg = require('../package.json');
const lib = require('../lib');

program
    .version(pkg.version)
    .option('-d, --source-dir <path>', `source directory; defaults to ${lib.defaults.sourceDir}`)
    .option('-r, --remote-dir <path>', `remote directory; defaults to ${lib.defaults.remoteDir}`)
    .option('-c, --config-path <path>', `path to config file; defaults to \${sourceDir}/${lib.defaults.configfileName}`)
    .option('-p, --profile <name>', `configuration profile to use; defaults to ${lib.defaults.profile}`)
    .option('-H, --ftp-host <host>', 'FTP host')
    .option('-P, --ftp-port <port>', 'FTP port')
    .option('-U, --ftp-user <user>', 'FTP username')
    .option('-X, --ftp-pass <pass>', 'FTP password')
    .option('-s, --stop-on-error', `stop on error`)
    .parse(process.argv);

lib.main({
    sourceDir: program.sourceDir,
    remoteDir: program.remoteDir,
    configPath: program.configPath,
    profile: program.profile,
    ftp: {
        host: program.ftpHost,
        port: program.ftpPort,
        user: program.ftpUser,
        pass: program.ftpPass,
    },
    stopOnError: program.stopOnError,
})
.on('DirDone', function(err, dirpath) {
    if (err) return out.error(`DirDone with Error: ${dirpath} :: ${err}`);
    return out.info(`DirDone: ${dirpath}`);
})
.on('WalkerError', function(err) {
    return out.error(`WalkerError: ${err}`);
})
.on('FTPError', function(err) {
    return out.error(`FTPError: ${err}`);
})
.on('Exit', function(err) {
    return out.info(`Exit :: ${err}`);
})
;
