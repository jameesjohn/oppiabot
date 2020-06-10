const openEvent = 'opened';
const reopenEvent = 'reopened';
const labelEvent = 'labeled';
const synchronizeEvent = 'synchronize';
const closeEvent = 'closed';
const editEvent = 'edited';

const claCheck = 'cla-check';
const changelogCheck = 'changelog-check';
// This check is required in re-open events as well to
// prevent user from reopening the PR.
const branchCheck = 'branch-check';
const wipCheck = 'wip-check';
const assigneeCheck = 'assignee-check';
const mergeConflictCheck = 'merge-conflict-check';
const allMergeConflictCheck = 'all-merge-conflict-check';
const jobCheck = 'job-check';

const checksWhitelist = {
  'oppia-android': {
    [openEvent]: [claCheck],
    [reopenEvent]: [],
    [labelEvent]: [],
    [synchronizeEvent]: [],
    [closeEvent]: [],
    [editEvent]: []
  },
  oppia: {
    [openEvent]: [claCheck, changelogCheck, branchCheck, wipCheck, jobCheck],
    [reopenEvent]: [changelogCheck, branchCheck, wipCheck],
    [labelEvent]: [assigneeCheck],
    [synchronizeEvent]: [mergeConflictCheck, jobCheck],
    [closeEvent]: [allMergeConflictCheck],
    [editEvent]: [wipCheck]
  },
};

module.exports.openEvent = openEvent;
module.exports.reopenEvent = reopenEvent;
module.exports.labelEvent = labelEvent;
module.exports.synchronizeEvent = synchronizeEvent;
module.exports.closeEvent = closeEvent;
module.exports.editEvent = editEvent;

module.exports.claCheck = claCheck;
module.exports.changelogCheck = changelogCheck;
module.exports.branchCheck = branchCheck;
module.exports.wipCheck = wipCheck;
module.exports.assigneeCheck = assigneeCheck;
module.exports.mergeConflictCheck = mergeConflictCheck;
module.exports.allMergeConflictCheck = allMergeConflictCheck;
module.exports.jobCheck = jobCheck;

module.exports.getChecksWhitelist = function() {
  return checksWhitelist;
};
