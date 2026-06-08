# Contributing to the lung scan prototype

This guide explains how to contribute to the Check if you need a lung scan prototype using GitHub Desktop and the GitHub website.

It is written for people who do not work with code every day, including content designers, service designers, interaction designers, product managers and delivery managers.

You do not need to use the command line to follow this guide.

## Before you start

You need:

- access to the `NHSDigital` organisation on GitHub
- access to the `NHSDigital/prototype-lung-health-check` repository
- GitHub Desktop installed
- optionally, Visual Studio Code installed

You also need to be signed in to GitHub Desktop with the GitHub account that has access to the repository.

## Words used in this guide

GitHub and GitHub Desktop use some words that may be unfamiliar.

`Repository` means the project files on GitHub. The repository for this prototype is `NHSDigital/prototype-lung-health-check`.

`Clone` means making a copy of the repository on your computer.

`Branch` means a separate version of the repository where you can make changes without changing the main version straight away.

`Commit` means saving a set of changes in GitHub Desktop.

`Push` means sending your committed changes from your computer to GitHub.

`Pull request` means asking for your changes to be reviewed and merged into the main version of the prototype.

`Merge` means adding the changes from a pull request into the main version of the prototype.

## Clone the repository using GitHub Desktop

Cloning the repository gives you a copy of the prototype on your computer.

1. Open GitHub Desktop.
2. Sign in to GitHub if you are asked to.
3. In the top menu, select `File`, then `Clone repository`.
4. Select the `GitHub.com` tab.
5. Find and select `NHSDigital/prototype-lung-health-check`.
6. Choose where you want to save the repository on your computer.
7. Select `Clone`.

GitHub Desktop will download the repository. When it has finished, you will have a local copy of the prototype on your computer.

If you cannot see the repository, check that you are signed in with the right GitHub account and that you have access to the `NHSDigital` organisation.

## Create a branch using GitHub Desktop

Create a branch before making changes. This keeps your work separate from the main version of the prototype until it has been reviewed.

1. Open GitHub Desktop.
2. Open the `prototype-lung-health-check` repository if it is not already open.
3. Select the `Current branch` button near the top of the window.
4. Select `New branch`.
5. Enter a short, clear branch name.
6. Select `Create branch`.

Use a branch name that describes the change. For example:

- `update-smoking-question-content`
- `add-review-page-guidance`
- `fix-results-page-typo`

Avoid branch names like `changes`, `updates` or `my-branch`, because they do not explain what the work is about.

After creating the branch, check that GitHub Desktop shows your new branch as the current branch. Make your changes on this branch, not on `main`.

## Make changes to the prototype

You can open and edit the prototype files in the tool your team uses.

If you have Visual Studio Code installed:

1. In GitHub Desktop, select `Repository`.
2. Select `Open in Visual Studio Code`.
3. Make your changes in Visual Studio Code.
4. Save the files you changed.

If you are not using Visual Studio Code:

1. In GitHub Desktop, select `Repository`.
2. Select `Show in Finder`.
3. Open the files you need to edit in your preferred editor.
4. Save the files you changed.

For content changes, you may often work in files such as:

- `app/prototype_v4_3/data/questions.yaml`
- `app/prototype_v4_3/data/pages.yaml`

Check with the team if you are not sure which version of the prototype or which file to change.

## Commit and push changes using GitHub Desktop

After saving your changes, return to GitHub Desktop.

GitHub Desktop will show the files you have changed. Review the list of changed files before committing.

1. Check that you are on the correct branch.
2. Review the changed files in GitHub Desktop.
3. Add a short summary in the `Summary` field.
4. Add a longer description if it would help someone understand the change.
5. Select `Commit to [branch name]`.

The commit is now saved on your computer.

To send the commit to GitHub:

1. Select `Push origin`.
2. Wait for GitHub Desktop to finish pushing the branch.

Your branch now exists on GitHub as well as on your computer. This means other people can see it and you can create a pull request.

Use commit summaries that describe the change in plain English. For example:

- `Update smoking history question content`
- `Add guidance for reviewing pull requests`
- `Fix typo on results page`

## Create a pull request

A pull request asks other people to review your changes before they are merged into the main version of the prototype.

1. In GitHub Desktop, check that you are on the branch that contains your changes.
2. Select `Create Pull Request`.
3. GitHub Desktop will open GitHub in your browser.
4. Check that the pull request is from your branch into the correct main branch.
5. Add a clear title.
6. Add a short description of what changed and why.
7. Add anything reviewers should check carefully.
8. Request a review from the right person or people.
9. Select `Create pull request`.

The pull request title should be clear enough for someone to understand the purpose of the change without opening it.

In the description, include:

- what you changed
- why you changed it
- any pages or journeys that are affected
- anything you are unsure about

For example:

```text
Updated the smoking history question content to match the latest agreed wording.

Please check:
- the question wording
- the error message
- whether the change affects any later pages in the journey
```

Ask someone to review the pull request. The reviewer should be someone who can check the content, design or technical impact of the change.

## Review a pull request on GitHub

Reviewing a pull request means checking someone else's changes before they are merged.

1. Open the pull request on GitHub.
2. Read the title and description.
3. Select the `Files changed` tab.
4. Review each changed file.
5. Add comments if you have questions or suggested changes.
6. Submit your review.

When reviewing, check:

- whether the change does what the pull request says it does
- whether the content is clear and accurate
- whether the change affects other pages or journeys
- whether there are spelling, grammar or formatting issues
- whether anything needs another person to check it

## Commenting on a pull request

You can leave comments in different ways.

Use a line comment when your comment is about a specific line in a file. For example, if a sentence is unclear, comment on that line.

Use a general pull request comment when your comment is about the change as a whole. For example, use a general comment if you want to ask why the change is needed.

Some comments are questions or suggestions. They do not always mean the pull request is blocked.

## Request changes or approve a pull request

When you submit a review, GitHub gives you different options.

Choose `Comment` if you want to leave feedback but you are not approving or blocking the pull request.

Choose `Request changes` if something must be changed before the pull request is merged.

Choose `Approve` if you are happy for the pull request to be merged.

Request changes when:

- the content is wrong or unclear
- the change does not match the agreed design or service decision
- an important part of the change is missing
- the change could create a problem elsewhere in the journey

Approve when:

- you have checked the change
- any important comments have been resolved
- you are happy for the work to be merged

Do not approve a pull request if you have only skimmed it or if you are still waiting for an important answer.

## Respond to review comments

If someone comments on your pull request, read each comment carefully.

If you need to make changes:

1. Go back to your local branch in GitHub Desktop.
2. Make the changes in your editor.
3. Save the files.
4. Commit the new changes in GitHub Desktop.
5. Push the branch again.

The pull request will update automatically when you push new commits.

If a comment has been dealt with, reply to say what you changed or mark the conversation as resolved if that is appropriate.

If you do not agree with a comment, reply with your reasoning and discuss it with the reviewer. Do not ignore review comments.

## Merge a pull request on GitHub

Merging a pull request adds the reviewed changes into the main version of the prototype.

Before merging, check:

- the pull request has been reviewed by the right person or people
- any requested changes have been made
- important comments have been answered or resolved
- the pull request is being merged into the correct branch
- the team is happy for the change to go into the prototype

To merge:

1. Open the pull request on GitHub.
2. Check the review status and comments.
3. Select the merge button.
4. Confirm the merge when GitHub asks you to.
5. Delete the branch if GitHub offers this option and the team no longer needs it.

After the pull request is merged, the changes are part of the main version of the prototype.

Do not merge your own pull request unless your team has agreed that this is acceptable.

## Good practice

Keep each pull request focused on one change or one group of closely related changes.

Create a new branch for each piece of work.

Pull the latest changes before starting new work, so your branch starts from the latest version of the prototype.

Use clear branch names and commit summaries.

Write pull request descriptions that explain what changed and why.

Ask for review early if you are unsure about a change.

Do not leave review comments unresolved without agreeing what should happen.

Check with the team before changing files if you are not sure what they do.
