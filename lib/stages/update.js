/**
 * The MIT License (MIT)
 * Copyright (c) 2016 GochoMugo <mugo@forfuture.co.ke>
 * Copyright (c) 2016 Forfuture, LLC < we@forfuture.co.ke>
 *
 * Stage: update remote
 * Actions:
 * - push files
 * - delete files
 * - update filelist
 */


// built-in modules
const path = require('path');


// npm-installed modules
const async = require('async');
const debug = require('debug')('ftpush:stages:update');


// own modules
const filelist = require('../filelist');


exports = module.exports = function update(globals, state, next) {
    // push the changed files
    function push(actionDone) {
        async.each(state.diffs.changed, function(filename, done) {
            var filepath = path.join(state.remotedir.path, filename);
            globals.ftp.put(state.localdir.buffers[filename], filepath, done);
        }, actionDone);
    }

    // delete the deleted files
    function del(actionDone) {
        // if we are to skip deletion, do so
        if (globals.options.skipDeletion) {
            return actionDone(null);
        }

        async.each(state.diffs.deleted, function(filename, done) {
            var filepath = path.join(state.remotedir.path, filename);
            globals.ftp.raw.dele(filepath, done);
        }, actionDone);
    }

    async.parallel([
        push,
        del,
    ], function(actionErr) {
        if (actionErr) {
            debug('error in push/del action: %s', actionErr);
            return next(actionErr);
        }
        // push an updated filelist
        var buffer = filelist.toBuffer(state.diffs.filelist);
        globals.ftp.put(buffer, state.remotedir.filelistpath, function(putErr) {
            return next(putErr);
        });
    });
};