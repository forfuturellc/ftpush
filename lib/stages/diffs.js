/**
 * The MIT License (MIT)
 * Copyright (c) 2016 GochoMugo <mugo@forfuture.co.ke>
 * Copyright (c) 2016 Forfuture, LLC <we@forfuture.co.ke>
 *
 * Stage: generate diffs
 * Actions:
 * - determine files to delete
 * - determine files to push
 */


// npm-installed modules
const _ = require('lodash');
const debug = require('debug')('fpush:stages:diffs');


// own modules
const constants = require('../constants');
const hash = require('../hash');


exports = module.exports = function diffs(globals, state, next) {
    var changed = [];
    var deleted = [];
    var filelist = _.cloneDeep(state.remotedir.filelist);

    // for each file in the directory
    for (var filename in state.localdir.buffers) {
        var localHash = hash.hashFileBuffer(state.localdir.buffers[filename]);
        var remoteHash = filelist[filename];

        // compare the hashes, to check for differences in content.
        // also consider a file, recorded in the file-list but has been deleted
        // from the remote directory.
        // we may also just want to ignore the filelist and push everything.
        const inRemote = function() {
            return state.remotedir.filenames.findIndex((rfilename) => {
                return rfilename === filename;
            }) !== -1;
        }
        if ((localHash !== remoteHash)
            || !inRemote()
            || globals.options.ignoreFilelist) {
            changed.push(filename);
            filelist[filename] = localHash;
        }
    }

    // for each file in the remote dir, that is not in the local directory
    // should be marked for deletion
    state.remotedir.filenames.forEach(function(filename) {
        // ignore the filelist
        if (filename === globals.options.filelistName) return;

        if (!state.localdir.buffers[filename]) {
            deleted.push(filename);
            delete filelist[filename];
        }
    });

    state.diffs = {
        changed: changed,
        deleted: deleted,
        filelist: filelist,
    };
    return next();
};


// code (constant) dedicated for this stage
exports.stageCode = constants.stage.diffs;
