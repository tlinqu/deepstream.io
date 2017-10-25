"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SocketWrapperFactoryMock = require("../test-mocks/socket-wrapper-factory-mock");
exports.showChars = function (input) {
    return input
        .replace(new RegExp(String.fromCharCode(31), 'g'), '|')
        .replace(new RegExp(String.fromCharCode(30), 'g'), '+');
};
exports.getBasePermissions = function () {
    return {
        presence: {
            '*': {
                allow: true
            }
        },
        record: {
            '*': {
                write: true,
                read: true
            }
        },
        event: {
            '*': {
                publish: true,
                subscribe: true
            }
        },
        rpc: {
            '*': {
                provide: true,
                request: true
            }
        }
    };
};
const message_connector_mock_1 = require("../test-mocks/message-connector-mock");
const logger_mock_1 = require("../test-mocks/logger-mock");
const storage_mock_1 = require("../test-mocks/storage-mock");
exports.getDeepstreamOptions = function (serverName) {
    const config = {
        serverName: serverName || 'server-name-a',
        stateReconciliationTimeout: 50,
        cacheRetrievalTimeout: 30,
        storageRetrievalTimeout: 50,
        storageExclusion: new RegExp('no-storage'),
        storageHotPathPatterns: [],
        permission: {
            options: {
                cacheEvacuationInterval: 60000,
                maxRuleIterations: 3
            }
        }
    };
    const services = {
        logger: new logger_mock_1.default(),
        cache: new storage_mock_1.default(),
        storage: new storage_mock_1.default(),
        message: new message_connector_mock_1.default(config),
        uniqueRegistry: {
            get(name, cb) { cb(true); },
            release() { }
        },
        permissionHandler: {
            nextResult: true,
            nextError: null,
            lastArgs: [],
            canPerformAction(a, b, c) {
                this.lastArgs.push([a, b, c]);
                c(this.nextError, this.nextResult);
            }
        }
    };
    return { config, services };
};
exports.getDeepstreamPermissionOptions = function () {
    const options = exports.getDeepstreamOptions();
    options.config = Object.assign(options.config, {
        cacheRetrievalTimeout: 500,
    });
    return { config: options.config, services: options.services };
};
const ConfigPermissionHandler = require('../../src/permission/config-permission-handler').default;
exports.testPermission = function (options) {
    return function (permissions, message, username, userdata, callback) {
        const permissionHandler = new ConfigPermissionHandler(options.config, options.services, permissions);
        permissionHandler.setRecordHandler({
            removeRecordRequest: () => { },
            runWhenRecordStable: (r, c) => { c(r); }
        });
        let permissionResult;
        username = username || 'someUser';
        userdata = userdata || {};
        callback = callback || function (error, result) {
            permissionResult = result;
        };
        permissionHandler.canPerformAction(username, message, callback, userdata, SocketWrapperFactoryMock.createSocketWrapper());
        return permissionResult;
    };
};
//# sourceMappingURL=test-helper.js.map