"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tl = require("azure-pipelines-task-lib/task");
const azdev = __importStar(require("azure-devops-node-api"));
function run() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const organization = tl.getInput('organization', true);
            const pat = tl.getInput('pat', true); //icsnoxzcyqp7rpc6xy5fnzmr3tclnomhadifg2ef7sznszofddva
            const inputField = tl.getInput('field', true);
            const pullRequestId = parseInt(tl.getInput('pullRequestId', true));
            const url = `https://dev.azure.com/${organization}`;
            const authHandler = azdev.getPersonalAccessTokenHandler(pat);
            const connection = new azdev.WebApi(url, authHandler);
            const pullRequestTrackApi = yield connection.getGitApi();
            const pullRequestInfo = yield pullRequestTrackApi.getPullRequestById(pullRequestId);
            let workItemRefs = yield pullRequestTrackApi.getPullRequestWorkItemRefs((_a = pullRequestInfo.repository) === null || _a === void 0 ? void 0 : _a.id, pullRequestId);
            let workItemId = undefined;
            if (workItemRefs) {
                var workItemIds = workItemRefs.map(wi => parseInt(wi.id));
                if (workItemIds.length == 0) {
                    tl.setResult(tl.TaskResult.Failed, "WorkItem not found for PullRequest");
                    return;
                }
                else {
                    workItemId = workItemIds[0];
                }
            }
            const workItemTrackingApi = yield connection.getWorkItemTrackingApi();
            const workItem = yield workItemTrackingApi.getWorkItem(workItemId);
            let inputFieldValue = undefined;
            if (workItem.fields) {
                if (inputField != undefined) {
                    inputFieldValue = workItem.fields[inputField];
                    console.log(inputFieldValue, inputField);
                }
            }
            if (inputField != null) {
                tl.setVariable(inputField, inputFieldValue);
            }
            tl.setResult(tl.TaskResult.Succeeded, "Task Successful");
        }
        catch (err) {
            if (typeof err === 'object' && err !== null) {
                tl.setResult(tl.TaskResult.Failed, err.toString());
            }
            else {
                console.log('Unexpected error', err);
            }
        }
    });
}
run();
