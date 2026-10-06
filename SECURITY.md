# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| 0.x (latest) | ✅ |

## Reporting a vulnerability

**Please do not open a public issue.** Use GitHub's [private vulnerability reporting](https://github.com/IrvingSamuel/quizplayer/security/advisories/new) instead. Include the steps to reproduce, the affected package(s) and versions, and the impact.

You will get a first answer within 7 days. After a fix is released, we will credit you in the advisory unless you prefer to stay anonymous.

## Scope notes

- Client-side features (the skip guard, `correct` embedded in the page) are UX features, **not** security boundaries. Use server validation (`endpoint`) when answers matter.
- The SDKs must ignore any `correct` value sent by clients. A bypass of this rule is in scope.
