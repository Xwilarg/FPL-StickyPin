var flashpoint = require("flashpoint-launcher");

var ref = require('ref-napi');
var ffi = require('ffi-napi');
var voidPtr = ref.refType(ref.types.void);
var lpdwordPtr = ref.refType(ref.types.ulong);

var user32 = ffi.Library('user32.dll', {
    EnumWindows: ['bool', [voidPtr, 'int32']],
    GetWindowThreadProcessId : ['int32', ['int32', lpdwordPtr]]
});

function activate(context) {
    flashpoint.services.onServiceNew((process) => {
        if (process.id.startsWith('game.')) {
            let pid = process.getPid();
            flashpoint.log.debug("New process with PID " + pid);

            let windowProc = ffi.Callback('bool', ['long', 'int32'], function(hwnd, lParam) {
                let alloc = ref.alloc(lpdwordPtr)
                user32.GetWindowThreadProcessId(hwnd, alloc);
                let res = alloc.readInt32LE(0);
                if (res === lParam) {
                    flashpoint.log.debug("Found it!");
                    return false;
                }
                return true;
            });
            user32.EnumWindows(windowProc, pid);
        }
    });
}

exports.activate = activate;