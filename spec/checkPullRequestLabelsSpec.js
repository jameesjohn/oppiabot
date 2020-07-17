require('dotenv').config();
const { createProbot } = require('probot');
// The plugin refers to the actual app in index.js.
const oppiaBot = require('../index');
const checkPullRequestLabelModule = require('../lib/checkPullRequestLabels');
const checkPullRequestJobModule = require('../lib/checkPullRequestJob');
const assignPRReviewersModule = require('../lib/assignPRReviewers');

const scheduler = require('../lib/scheduler');
let payloadData = JSON.parse(
  JSON.stringify(require('../fixtures/pullRequestPayload.json'))
);

describe('Pull Request Label Check', () => {
  /**
   * @type {import('probot').Probot} robot
   */
  let robot;

  /**
   * @type {import('probot').Octokit} github
   */
  let github;

  /**
   * @type {import('probot').Application} app
   */
  let app;

  beforeEach(() => {
    spyOn(scheduler, 'createScheduler').and.callFake(() => {});

    github = {
      issues: {
        createComment: jasmine.createSpy('createComment').and.returnValue({}),
        addAssignees: jasmine.createSpy('addAssignees').and.resolveTo({}),
        removeLabel: jasmine.createSpy('removeLabel').and.resolveTo({}),
        addLabels: jasmine.createSpy('addLabels').and.resolveTo({}),
      },
      repos: {
        checkCollaborator: jasmine.createSpy('checkCollaborator').and.callFake(
          (params) => {
            if (params.username === 'newuser') {
              return {status: 404};
            }
            return {status: 204};
          })
      }
    };

    robot = createProbot({
      id: 1,
      cert: 'test',
      githubToken: 'test',
    });

    app = robot.load(oppiaBot);
    spyOn(app, 'auth').and.resolveTo(github);
    spyOn(checkPullRequestJobModule, 'checkForNewJob').and.callFake(() =>{});
  });

  describe('when an issue label gets added', () =>{
    const label = {
      id: 638839900,
      node_id: 'MDU6TGFiZWw2Mzg4Mzk5MDA=',
      url: 'https://api.github.com/repos/oppia/oppia/labels/PR:%20released',
      name: 'good first issue',
      color: '00FF00',
    };

    beforeEach(async () => {
      payloadData.payload.action = 'labeled';
      payloadData.payload.label = label;
      spyOn(checkPullRequestLabelModule, 'checkForIssueLabel').and.callThrough();
      await robot.receive(payloadData);
    });

    it('checks the label', () =>{
      expect(checkPullRequestLabelModule.checkForIssueLabel).toHaveBeenCalled();
    });

    it('comments on the PR', () => {
      expect(github.issues.createComment).toHaveBeenCalled();

      const link = 'here'.link(
        'https://github.com/oppia/oppia/wiki/Contributing-code-to-Oppia#' +
          'labeling-issues-and-pull-requests'
      );
      expect(github.issues.createComment).toHaveBeenCalledWith({
        body:'Hi @' + payloadData.payload.sender.login + ', the good ' +
          'first issue label should only be used on issues, and I’m ' +
          'removing the label. You can learn more about ' +
          'labels ' + link + '. Thanks!',
        number: payloadData.payload.pull_request.number,
        owner: payloadData.payload.repository.owner.login,
        repo: payloadData.payload.repository.name
      });
    });

    it('removes the label', () => {
      expect(github.issues.removeLabel).toHaveBeenCalled();
      expect(github.issues.removeLabel).toHaveBeenCalledWith({
        name: 'good first issue',
        number: payloadData.payload.pull_request.number,
        owner: payloadData.payload.repository.owner.login,
        repo: payloadData.payload.repository.name
      });
    });

  });

  describe('when a pr label gets added', () =>{
    const label = {
      id: 638839900,
      node_id: 'MDU6TGFiZWw2Mzg4Mzk5MDA=',
      url: 'https://api.github.com/repos/oppia/oppia/labels/PR:%20released',
      name: 'dependencies',
      color: '00FF00',
    };

    beforeEach(async () => {
      payloadData.payload.action = 'labeled';
      payloadData.payload.label = label;
      spyOn(checkPullRequestLabelModule, 'checkForIssueLabel').and.callThrough();
      await robot.receive(payloadData);
    });

    it('checks the label', () =>{
      expect(checkPullRequestLabelModule.checkForIssueLabel).toHaveBeenCalled();
    });

    it('does not comment on the PR', () => {
      expect(github.issues.createComment).not.toHaveBeenCalled();
    });

    it('does not remove the label', () => {
      expect(github.issues.removeLabel).not.toHaveBeenCalled();
    });
  });

  describe('when critical label gets removed by non whitelisted user', () => {
    const label = {
      id: 638839900,
      node_id: 'MDU6TGFiZWw2Mzg4Mzk5MDA=',
      url: 'https://api.github.com/repos/oppia/oppia/labels/PR:%20released',
      name: 'critical',
      color: '00FF00',
    };

    beforeEach(async () => {
      payloadData.payload.action = 'unlabeled';
      payloadData.payload.label = label;
      spyOn(checkPullRequestLabelModule, 'checkCriticalLabel').and.callThrough();
      await robot.receive(payloadData);
    });

    it('should check for critical label', () => {
      expect(checkPullRequestLabelModule.checkCriticalLabel).toHaveBeenCalled();
    });

    it('should comment on PR', () => {
      expect(github.issues.createComment).toHaveBeenCalled();
      expect(github.issues.createComment).toHaveBeenCalledWith({
        body: 'Hi @' + payloadData.payload.sender.login +
          ', only members of the release team /cc @oppia/release-coordinators ' +
          'are allowed to remove critical labels. ' +
          'I will be adding it back. Thanks!',
        number: payloadData.payload.pull_request.number,
        owner: payloadData.payload.repository.owner.login,
        repo: payloadData.payload.repository.name
      })
    })

    it('should add the critical label', () => {
      expect(github.issues.addLabels).toHaveBeenCalled();
      expect(github.issues.addLabels).toHaveBeenCalledWith({
        labels: ['critical'],
        number: payloadData.payload.pull_request.number,
        owner: payloadData.payload.repository.owner.login,
        repo: payloadData.payload.repository.name
      });
    });

  });

  describe('when critical label gets removed by whitelisted user', () => {
    const label = {
      id: 638839900,
      node_id: 'MDU6TGFiZWw2Mzg4Mzk5MDA=',
      url: 'https://api.github.com/repos/oppia/oppia/labels/PR:%20released',
      name: 'critical',
      color: '00FF00',
    };

    beforeEach(async () => {
      payloadData.payload.action = 'unlabeled';
      payloadData.payload.label = label;
      payloadData.payload.sender.login = 'seanlip';
      spyOn(checkPullRequestLabelModule, 'checkCriticalLabel').and.callThrough();
      await robot.receive(payloadData);
    });

    it('checks for critical label', () =>{
      expect(checkPullRequestLabelModule.checkCriticalLabel).toHaveBeenCalled();
    });

    it('does not add back the label', () => {
      expect(github.issues.addLabels).not.toHaveBeenCalled();
    });

    it('does not comment on the PR', () => {
      expect(github.issues.createComment).not.toHaveBeenCalled();
    });

  });

  describe('when another label gets removed', () => {
    const label = {
      id: 638839900,
      node_id: 'MDU6TGFiZWw2Mzg4Mzk5MDA=',
      url: 'https://api.github.com/repos/oppia/oppia/labels/PR:%20released',
      name: 'dependencies',
      color: '00FF00',
    };

    beforeEach(async () => {
      payloadData.payload.action = 'unlabeled';
      payloadData.payload.label = label;
      spyOn(checkPullRequestLabelModule, 'checkCriticalLabel').and.callThrough();
      await robot.receive(payloadData);
    });

    it('checks for critical label', () =>{
      expect(checkPullRequestLabelModule.checkCriticalLabel).toHaveBeenCalled();
    });

    it('does not add back the label', () => {
      expect(github.issues.addLabels).not.toHaveBeenCalled();
    });

    it('does not comment on the PR', () => {
      expect(github.issues.createComment).not.toHaveBeenCalled();
    });

  });

  describe('when pull request gets opened or reopened', () => {
    it('pings pr author when there is no changelog label', async () => {
      payloadData.payload.action = 'reopened';

      spyOn(
        checkPullRequestLabelModule,
        'checkChangelogLabel'
      ).and.callThrough();
      await robot.receive(payloadData);

      expect(
        checkPullRequestLabelModule.checkChangelogLabel
      ).toHaveBeenCalled();
      expect(github.issues.createComment).toHaveBeenCalled();
      const params = {
        repo: payloadData.payload.repository.name,
        owner: payloadData.payload.repository.owner.login,
        number: payloadData.payload.number,
        body:
          'Hi, @' +
          payloadData.payload.pull_request.user.login +
          ', this pull request does not have a "CHANGELOG: ..." label ' +
          'as mentioned in the PR checkbox list. Please add this label. ' +
          'PRs without this label will not be merged. If you are unsure ' +
          'of which label to add, please ask the reviewers for ' +
          'guidance. Thanks!',
      };
      expect(github.issues.createComment).toHaveBeenCalledWith(params);
    });

    it('adds a default label when pr author is not a collaborator', async () => {
      payloadData.payload.action = 'reopened';
      payloadData.payload.pull_request.user.login = 'newuser';

      spyOn(
        checkPullRequestLabelModule,
        'checkChangelogLabel'
      ).and.callThrough();
      await robot.receive(payloadData);

      expect(
        checkPullRequestLabelModule.checkChangelogLabel
      ).toHaveBeenCalled();
      expect(github.issues.addLabels).toHaveBeenCalled();
      const labelParams = {
        repo: payloadData.payload.repository.name,
        owner: payloadData.payload.repository.owner.login,
        issue_number: payloadData.payload.number,
        labels: ['PR CHANGELOG: Miscellaneous -- @ankita240796']
      };
      expect(github.issues.addLabels).toHaveBeenCalledWith(labelParams);

      expect(github.issues.createComment).toHaveBeenCalled();
      const commentParams = {
        repo: payloadData.payload.repository.name,
        owner: payloadData.payload.repository.owner.login,
        number: payloadData.payload.number,
        body:
          'Hi, @' +
          payloadData.payload.pull_request.user.login +
          ', I have added a default changelog label to the pull request. ' +
          'Thanks!',
      };
      expect(github.issues.createComment).toHaveBeenCalledWith(commentParams);
    });

    it('should not ping pr author if there is a changelog label', async() => {
      const label = {
        id: 638839900,
        node_id: 'MDU6TGFiZWw2Mzg4Mzk5MDA=',
        url: 'https://api.github.com/repos/oppia/oppia/labels/PR:%20released',
        name: 'PR CHANGELOG: Server Errors -- @kevintab95',
        color: '00FF00',
      };
      payloadData.payload.action = 'reopened';
      // Add changelog label.
      payloadData.payload.pull_request.labels.push(label)
      spyOn(
        checkPullRequestLabelModule,
        'checkChangelogLabel'
      ).and.callThrough();
      await robot.receive(payloadData);

      expect(
        checkPullRequestLabelModule.checkChangelogLabel
      ).toHaveBeenCalled();

      expect(github.issues.createComment).not.toHaveBeenCalled();
    });

    it('pings dev workflow team if changelog label is invalid', async () => {
      const label = {
        id: 638839900,
        node_id: 'MDU6TGFiZWw2Mzg4Mzk5MDA=',
        url: 'https://api.github.com/repos/oppia/oppia/labels/PR:%20released',
        name: 'PR CHANGELOGS: Server Errors -- @kevintab95',
        color: '00FF00',
      };

      payloadData.payload.action = 'reopened';
      payloadData.payload.pull_request.labels = [label];
      spyOn(
        checkPullRequestLabelModule,
        'checkChangelogLabel'
      ).and.callThrough();
      await robot.receive(payloadData);

      expect(
        checkPullRequestLabelModule.checkChangelogLabel
      ).toHaveBeenCalled();
      const params = {
        repo: payloadData.payload.repository.name,
        owner: payloadData.payload.repository.owner.login,
        number: payloadData.payload.number,
        body:
          'Hi, @oppia/dev-workflow-team.' +
          ' The changelog label on this pull request seems to be invalid.' +
          ' Can you please take a look at this pull request? Thanks!',
      };
      expect(github.issues.createComment).toHaveBeenCalled();
      expect(github.issues.createComment).toHaveBeenCalledWith(params);
    });

    it('does not ping dev workflow team for valid changelog label', async () => {
      const label = {
        id: 638839900,
        node_id: 'MDU6TGFiZWw2Mzg4Mzk5MDA=',
        url: 'https://api.github.com/repos/oppia/oppia/labels/PR:%20released',
        name: 'PR CHANGELOG: Server Errors -- @kevintab95',
        color: '00FF00',
      };

      payloadData.payload.action = 'reopened';

      payloadData.payload.pull_request.labels = [label];
      spyOn(
        checkPullRequestLabelModule,
        'checkChangelogLabel'
      ).and.callThrough();
      await robot.receive(payloadData);

      expect(
        checkPullRequestLabelModule.checkChangelogLabel
      ).toHaveBeenCalled();
      expect(github.issues.createComment).not.toHaveBeenCalled();
    });
  });
});
