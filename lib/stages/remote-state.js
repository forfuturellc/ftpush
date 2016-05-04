/**
 * The MIT License (MIT)
 * Copyright (c) 2016 GochoMugo <mugo@forfuture.co.ke>
 * Copyright (c) 2016 Forfuture, LLC < we@forfuture.co.ke>
 *
 * Stage: determine state of remote server
 * Actions:
 * - retrieve file listing of remote directory
 * - retrieve filelist from remote server
 */


// npm-installed modules
const async = require('async');
const debug = require('debug')('ftpush:stages:remote-state');


// own modules
const filelist = require('../filelist');


exports = module.exports = function remoteState(globals, state, next) {
    return async.series([
        // retrieving listing of the remote directory
        function(done) {
            globals.ftp.ls(state.remotedir.path, function(lsErr, contents) {
                if (lsErr) {
                    debug('error listing contents of remote dir: %s', lsErr);
                    // if the directory does not exist, we create it
                    if (lsErr.code === 550) {
                        return globals.ftp.raw.mkd(state.remotedir.path, done);
                    }
                    return done(lsErr);
                }
                // filter files only. Also remove the filelist.
                state.remotedir.contents = contents.filter(function(file) {
                    return file.type === 0;
                });
                return done(null);
            });
        },
        // retrieving filelist, if available
        function(done) {
            // check if the filelist is available
            var found = state.remotedir.contents.find(function(file) {
                return file.name === globals.options.filelistName;
            });
            if (!found) return done(null);

            var partBuffers = [];
            globals.ftp.get(state.remotedir.filelistpath, function(getErr, socket) {
                if (getErr) {
                    debug('error retrieving file-list: %s', getErr);
                    return done(getErr);
                }
                socket.on('data', function(buffer) { partBuffers.push(buffer); })
                socket.on('close', function(socketErr) {
                    if (socketErr) {
                        debug('error retrieving file-list (on socket): %s', socketErr);
                        throw socketErr;
                    }
                    var buffer = Buffer.concat(partBuffers);
                    var list;
                    // try parse the filelist
                    try {
                        state.filelist = filelist.parse(buffer);
                    } catch(parseErr) {
                        debug('error parsing file-list: %s', parseErr);
                        return done(parseErr);
                    }
                    return done(null);;
                });
                socket.resume();
            });
        },
    ], next);
};