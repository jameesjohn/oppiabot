// Copyright 2020 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview File to handle checks when a branch gets forced pushed.
 */

/**
 * @param {Number} ms - Sleep time.
 */
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * @param {import('probot').Context} context
 */
const handleForcePush = async (context) => {
  if (context.payload.forced === true) {
    // Get the commit SHA after the push.
    const sha = context.payload.after;
    let pullRequest;
    do {
      // Wait for 2 seconds before searching so that the pull request
      // would have been synchronized with the new commit.
      await sleep(2000);
      const pullRequestData = await context.github.search.issuesAndPullRequests({
        q: `${sha} repo:${context.payload.repository.full_name}`,
      });
      // Since we are searching via the sha, only one PR will be found,
      // which is the PR that we are looking for.
      pullRequest = pullRequestData.data.items[0]
    } while(pullRequest === undefined);

    const user = context.payload.sender.login;
    const link = 'here'.link(
      'https://github.com/oppia/oppia/wiki/Contributing-code-to-Oppia' +
      '#instructions-for-making-a-code-change');
    const commentParams = context.repo({
      body: 'Hi @'+ user +
      ', force pushing is not allowed as it makes code reviews hard. ' +
      'You can learn more about this '+ link + '. I’ll be closing this, ' +
      'please make a new PR with the required changes. Thanks!',
      issue_number: pullRequest.number,
    });
    await context.github.issues.createComment(commentParams);

    const closePRParams = context.repo({
      issue_number: pullRequest.number,
      state: 'closed',
    });
    await context.github.issues.update(closePRParams);
  }
};

module.exports = {
  handleForcePush
}
