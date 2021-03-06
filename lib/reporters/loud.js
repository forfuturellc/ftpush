/**
 * The MIT License (MIT)
 * Copyright (c) 2016 GochoMugo <mugo@forfuture.co.ke>
 * Copyright (c) 2016 Forfuture, LLC < we@forfuture.co.ke>
 *
 * The 'loud' reporter.
 */


exports = module.exports = reporter;


// npm-installed modules
const out = require('cli-output');


function reporter(emitter) {
    return emitter
        .on('Info', function(message) {
            return out.info(message);
        })
        .on('Config', function(config) {
            return out.pjson(config);
        })
        .on('DirDone', function(err, dirpath) {
            if (err) return out.error(`DirDone with Error: ${dirpath} :: ${err}`);
            return out.info(`DirDone: ${dirpath}`);
        })
        .on('ConfigError', function(err) {
            return out.error(`ConfigError: ${err}`);
        })
        .on('WalkerError', function(err) {
            return out.error(`WalkerError: ${err}`);
        })
        .on('DriverError', function(err) {
            return out.error(`DriverError: ${err}`);
        })
        .on('Exit', function(err) {
            return out.info(`Exit :: ${err}`);
        })
        ;
}
