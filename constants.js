const openEvent = 'opened';
const reopenEvent = 'reopened';
const labelEvent = 'labeled';
const unlabelEvent = 'unlabeled';
const synchronizeEvent = 'synchronize';
const closeEvent = 'closed';
const editEvent = 'edited';
const issuesLabelEvent = 'issues_labeled'
const issuesAssignedEvent = 'issues_assigned'

const claCheck = 'cla-check';
const changelogCheck = 'changelog-check';
const criticalLabelCheck = 'critical-label-check';
const prLabelCheck = 'pr-label-check';
// This check is required in re-open events as well to
// prevent user from reopening the PR.
const branchCheck = 'branch-check';
const wipCheck = 'wip-check';
const assigneeCheck = 'assignee-check';
const mergeConflictCheck = 'merge-conflict-check';
const allMergeConflictCheck = 'all-merge-conflict-check';
const jobCheck = 'job-check';
const issuesLabelCheck = 'issues-labeled-check'
const issuesAssignedCheck = 'issues-assigned-check'

const checksWhitelist = {
  'oppia-android': {
    [openEvent]: [claCheck],
    [reopenEvent]: [],
    [labelEvent]: [],
    [synchronizeEvent]: [],
    [closeEvent]: [],
    [editEvent]: [],
    [issuesLabelEvent]: []
  },
  'oppia': {
    [openEvent]: [claCheck, changelogCheck, branchCheck, wipCheck, jobCheck],
    [reopenEvent]: [changelogCheck, branchCheck, wipCheck, jobCheck],
    [labelEvent]: [assigneeCheck, prLabelCheck],
    [synchronizeEvent]: [mergeConflictCheck, jobCheck],
    [closeEvent]: [allMergeConflictCheck],
    [editEvent]: [wipCheck],
    [issuesLabelEvent]: [issuesLabelCheck],
    [issuesAssignedEvent]: [issuesAssignedCheck],
    [unlabelEvent]: [criticalLabelCheck]
  },
  'oppiabot': {
    [openEvent]: [claCheck],
    [reopenEvent]: [],
    [synchronizeEvent]: [mergeConflictCheck],
    [closeEvent]: [allMergeConflictCheck],
    [editEvent]: []
  }
};

module.exports.openEvent = openEvent;
module.exports.reopenEvent = reopenEvent;
module.exports.labelEvent = labelEvent;
module.exports.unlabelEvent = unlabelEvent;
module.exports.synchronizeEvent = synchronizeEvent;
module.exports.closeEvent = closeEvent;
module.exports.editEvent = editEvent;
module.exports.issuesLabelEvent = issuesLabelEvent;
module.exports.issuesAssignedEvent = issuesAssignedEvent;

module.exports.claCheck = claCheck;
module.exports.changelogCheck = changelogCheck;
module.exports.branchCheck = branchCheck;
module.exports.wipCheck = wipCheck;
module.exports.assigneeCheck = assigneeCheck;
module.exports.mergeConflictCheck = mergeConflictCheck;
module.exports.allMergeConflictCheck = allMergeConflictCheck;
module.exports.jobCheck = jobCheck;
module.exports.issuesLabelCheck = issuesLabelCheck;
module.exports.issuesAssignedCheck = issuesAssignedCheck;
module.exports.criticalLabelCheck = criticalLabelCheck;
module.exports.prLabelCheck = prLabelCheck;

module.exports.getChecksWhitelist = function() {
  return checksWhitelist;
};
