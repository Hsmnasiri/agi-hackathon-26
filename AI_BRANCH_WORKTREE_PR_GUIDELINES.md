# AI Branch, Worktree, and Pull Request Guidelines

These guidelines define the required workflow for AI-driven feature work in this repository.

## Core Rule

Every feature addition must start from the latest `main`, happen in a separate Git worktree, be pushed to a feature branch, pass CI, and be merged only after all required checks are green.

Do not implement feature work directly in the primary `main` checkout.

## Required Workflow

### 1. Verify the current repository state

Before starting work, inspect the current checkout:

```bash
git status --short
git branch --show-current
```

If there are uncommitted changes that are not part of the requested work, do not overwrite, reset, or discard them. Treat them as user-owned changes.

### 2. Update `main`

Start every feature from the latest remote `main`:

```bash
git fetch origin
git switch main
git pull --ff-only origin main
```

If `main` cannot be updated cleanly, stop and resolve the branch state before creating feature work.

### 3. Create a feature worktree

Use a descriptive branch name with a clear prefix:

```bash
git worktree add ../agi-hackathon-26-<feature-slug> -b feat/<feature-slug> main
cd ../agi-hackathon-26-<feature-slug>
```

Branch naming examples:

```text
feat/add-user-settings
fix/login-validation
chore/update-ci-config
docs/branch-workflow-guidelines
```

Keep one feature or fix per branch. Do not mix unrelated changes into the same worktree.

### 4. Implement and test locally

Make the requested code or documentation changes inside the feature worktree.

Before committing, run the relevant local checks for the project, such as:

```bash
npm test
npm run lint
npm run build
pytest
```

Use the commands that actually exist in the repository. If no automated tests exist, state that clearly in the pull request.

### 5. Commit the work

Review the diff before committing:

```bash
git status --short
git diff
```

Commit with a concise message:

```bash
git add <changed-files>
git commit -m "<type>: <short summary>"
```

Examples:

```text
feat: add account settings page
fix: handle empty transaction imports
docs: add branch workflow guidelines
```

### 6. Push the feature branch

Push the branch and set upstream tracking:

```bash
git push -u origin <branch-name>
```

### 7. Create a pull request

Open a pull request from the feature branch into `main`.

Using GitHub CLI:

```bash
gh pr create --base main --head <branch-name> --title "<PR title>" --body "<PR summary>"
```

The pull request description should include:

- What changed
- Why the change was made
- How it was tested
- Any known limitations or follow-up work

### 8. Wait for CI

Do not merge while CI is pending, failing, skipped unexpectedly, or missing required checks.

Monitor pull request checks:

```bash
gh pr checks --watch
```

If CI fails, fix the issue in the same feature worktree, commit the fix, and push again:

```bash
git add <changed-files>
git commit -m "fix: address ci failure"
git push
```

Repeat until all required CI checks pass.

### 9. Merge only after all checks pass

Only merge after:

- The branch is up to date with `main`
- All required CI checks have passed
- Required reviews or approvals are complete
- The pull request diff contains only the intended changes

Preferred merge command:

```bash
gh pr merge --squash --delete-branch
```

Use the repository's established merge strategy if it differs from squash merging.

### 10. Clean up the local worktree

After the pull request is merged and the remote branch is deleted, remove the local worktree:

```bash
cd ../agi-hackathon-26
git worktree remove ../agi-hackathon-26-<feature-slug>
git fetch --prune
```

## Non-Negotiable Guardrails

- Never commit directly to `main` for feature additions.
- Never merge a pull request with failing or pending required CI checks.
- Never reset, discard, or overwrite user-owned changes without explicit permission.
- Never combine unrelated features, fixes, or refactors in one branch.
- Always document test results in the pull request.
- Always keep the feature branch focused and reviewable.

