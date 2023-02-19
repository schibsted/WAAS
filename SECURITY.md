# Security Notice

This document outlines general security procedures and policies for the partall-list Github repo.

Since this is mostly a tool you run on your own machine, I am posting this policy to be on the safe side.

## Reporting a vulnerability

Please report security vulnerabilities to Schibsted via the built in [Github advisories](https://github.com/schibsted/WAAS/security/advisories/new).
We'll try to send a response back to you as fast as possible. Please allow the vulnerability to be fixed before any public exposure, as this will help protect all of the people who use a fork of the repo.

Within the report of the issue, please provide the following information:

- History of how long the vulnerability existed in the project (e.g. commit version)
- Component(s) affected
- A description of the vulnerability, the impact, and how to reproduce it
- Recommended remediations
- (Optional) Code, screenshots, or videos of the vulnerability (but no executable binaries)

## Communication

GitHub Security Advisory will be used to communicate during the process of identifying, fixing and shipping the mitigation of the vulnerability.

The advisory will only be made public when the patched version is released to inform the community of the breach and its potential security impact.

## Scope

The following items are **not** in scope:

- High volume vulnerabilities, such as overwhelming the service with requests, Dos, brute force attacks, etc.
- Vulnerabilities from old versions of the project
- Spam reports
- Self Cross Site Scripting (XSS) (user defined payload)
- Social engineering
- Phishing Attempts
- Third party systems not directly under our control

## Compensation

We do not provide compensation for reporting vulnerabilities, except for eternal gratitude and a mention in the fix :)
