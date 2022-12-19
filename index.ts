import tl = require('azure-pipelines-task-lib/task');
import * as azdev from "azure-devops-node-api";

async function run() {
    try {
        const organization = tl.getInput('organization', true);
        const pat = tl.getInput('pat', true) //icsnoxzcyqp7rpc6xy5fnzmr3tclnomhadifg2ef7sznszofddva
        const inputField: string | undefined = tl.getInput('field', true);
        const pullRequestId: number | undefined = parseInt(<string>tl.getInput('pullRequestId', true));

        const url = `https://dev.azure.com/${organization}`
        const authHandler = azdev.getPersonalAccessTokenHandler(<string>pat);
        const connection = new azdev.WebApi(url, authHandler);
        const pullRequestTrackApi = await connection.getGitApi();
        const pullRequestInfo = await pullRequestTrackApi.getPullRequestById(pullRequestId);
        let workItemRefs = await pullRequestTrackApi.getPullRequestWorkItemRefs(<string>pullRequestInfo.repository?.id, pullRequestId);
        let workItemId : number | undefined = undefined;
        if (workItemRefs) {
            var workItemIds = workItemRefs.map(wi => parseInt(<string>wi.id));
            if (workItemIds.length == 0) {
                tl.setResult(tl.TaskResult.Failed, "WorkItem not found for PullRequest");
                return
            } else{
                workItemId = workItemIds[0]
            }
        }
        const workItemTrackingApi = await connection.getWorkItemTrackingApi();
        const workItem = await workItemTrackingApi.getWorkItem(<number>workItemId);
        let inputFieldValue : string | undefined = undefined;
        if (workItem.fields) {
            if (inputField!= undefined) {
                inputFieldValue = workItem.fields[inputField]
                console.log(inputFieldValue,inputField)
            }
        }
        if(inputField != null){
            tl.setVariable(inputField,<string>inputFieldValue)
        }
        tl.setResult(tl.TaskResult.Succeeded, "Task Successful");
    }
    catch (err) {
        if (typeof err === 'object' && err !== null) {
            tl.setResult(tl.TaskResult.Failed, err.toString());
        } else {
            console.log('Unexpected error', err);
        }
    }
}

run();