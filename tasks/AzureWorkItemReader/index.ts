import tl from 'azure-pipelines-task-lib/task';
import azdev from "azure-devops-node-api";

async function run() {
    try {
        const organization = tl.getInput('organization', true);
        const pat = tl.getInput('pat', true) ?? '';
        const inputField = tl.getInput('field', true) ?? '';
        const pullRequestId = parseInt(tl.getInput('pullRequestId', true) ?? '');

        const url = `https://dev.azure.com/${organization}`
        const authHandler = azdev.getPersonalAccessTokenHandler(pat);
        const connection = new azdev.WebApi(url, authHandler);
        const pullRequestTrackApi = await connection.getGitApi();
        const pullRequestInfo = await pullRequestTrackApi.getPullRequestById(pullRequestId);
        const workItemRefs = await pullRequestTrackApi.getPullRequestWorkItemRefs(pullRequestInfo.repository?.id ?? '', pullRequestId);
        const workItemId = parseInt(workItemRefs?.[0].id ?? '')
 
        if (!workItemId) {
            tl.setResult(tl.TaskResult.Failed, 'WorkItem not found for PullRequest');
            return;
        }

        const workItemTrackingApi = await connection.getWorkItemTrackingApi();
        const workItem = await workItemTrackingApi.getWorkItem(workItemId);
        const inputFieldValue =  workItem.fields?.[inputField]
        if (inputField && inputFieldValue) {
            console.log(inputField, inputFieldValue)
            tl.setVariable(inputField, inputFieldValue)
        }

        tl.setResult(tl.TaskResult.Succeeded, 'Task Successful');
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