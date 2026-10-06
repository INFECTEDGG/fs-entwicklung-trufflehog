# TruffleHog Installation Guide

This guide explains how to install **TruffleHog** on **macOS, Windows, and Linux**. Alternatively, TruffleHog can be run using **Docker**, providing a platform-independent installation method.

> **Note:** After installation, verify that TruffleHog works by running `trufflehog --version`.

---

## Table of Contents

1. [macOS](#1-macos)
2. [Windows](#2-windows)
3. [Linux](#3-linux)
4. [Docker](#4-docker)
5. [Verify the Installation](#5-verify-the-installation)
6. [First Filesystem Scan](#6-first-filesystem-scan)

---

# 1. macOS

The easiest way to install TruffleHog on macOS is using **Homebrew**.

## Step 1 – Check Homebrew

Open the Terminal and run:

```bash
brew --version
```

If Homebrew is installed, a version number will be displayed.

If the command is not found, install Homebrew first:

https://brew.sh/

## Step 2 – Install TruffleHog

Run:

```bash
brew install trufflehog
```

Homebrew will download and install TruffleHog and its required dependencies.

## Step 3 – Verify the installation

Run:

```bash
trufflehog --version
```

If a version number is displayed, the installation was successful.

---

# 2. Windows

On Windows, TruffleHog can be installed using the official precompiled binary.

## Step 1 – Download TruffleHog

Open the official TruffleHog releases page:

https://github.com/trufflesecurity/trufflehog/releases

Under **Assets**, download the archive matching your system.

For most Windows computers:

```text
trufflehog_*_windows_amd64.tar.gz
```

For Windows on ARM:

```text
trufflehog_*_windows_arm64.tar.gz
```

## Step 2 – Extract the archive

Extract the downloaded archive.

The archive contains:

```text
trufflehog.exe
```

For example, create the following directory:

```text
C:\Tools\TruffleHog\
```

and place `trufflehog.exe` inside it.

The resulting structure should look like:

```text
C:\
└── Tools\
    └── TruffleHog\
        └── trufflehog.exe
```

## Step 3 – Open PowerShell

Open **PowerShell** and navigate to the directory:

```powershell
cd C:\Tools\TruffleHog
```

## Step 4 – Verify the installation

Run:

```powershell
.\trufflehog.exe --version
```

If a version number is displayed, TruffleHog is working correctly.

## Optional – Add TruffleHog to PATH

To use TruffleHog from any directory, add

```text
C:\Tools\TruffleHog
```

to the Windows `PATH` environment variable.

Afterwards, you can simply run:

```powershell
trufflehog --version
```

instead of:

```powershell
.\trufflehog.exe --version
```

---

# 3. Linux

TruffleHog provides an official installation script for Linux.

## Step 1 – Check your architecture

Open a terminal and run:

```bash
uname -m
```

Common results are:

```text
x86_64
```

or:

```text
aarch64
```

TruffleHog provides builds for both architectures.

## Step 2 – Install TruffleHog

Run:

```bash
curl -sSfL https://raw.githubusercontent.com/trufflesecurity/trufflehog/main/scripts/install.sh \
  | sudo sh -s -- -b /usr/local/bin
```

The installation script downloads the appropriate TruffleHog release and installs it into:

```text
/usr/local/bin
```

## Step 3 – Verify the installation

Run:

```bash
trufflehog --version
```

If a version number is displayed, the installation was successful.

---

# 4. Docker

TruffleHog can also be executed using Docker.

This method is useful because the same container can be used on:

- macOS
- Windows
- Linux

Docker must already be installed.

## Step 1 – Verify Docker

Run:

```bash
docker --version
```

If Docker is installed, a version number will be displayed.

## Step 2 – Download the TruffleHog image

Run:

```bash
docker pull trufflesecurity/trufflehog:latest
```

Docker will download the latest TruffleHog image.

## macOS / Linux

To scan the current directory:

```bash
docker run --rm \
  -v "$PWD:/pwd" \
  trufflesecurity/trufflehog:latest \
  filesystem /pwd
```

The current directory is mounted into the container under:

```text
/pwd
```

TruffleHog then performs a filesystem scan of that directory.

## Windows PowerShell

In PowerShell:

```powershell
docker run --rm `
  -v "${PWD}:/pwd" `
  trufflesecurity/trufflehog:latest `
  filesystem /pwd
```

---

# 5. Verify the Installation

For a native installation, run:

```bash
trufflehog --version
```

You should receive output containing the installed TruffleHog version.

You can also display the available commands:

```bash
trufflehog --help
```

This should display commands such as:

```text
git
github
gitlab
filesystem
docker
s3
...
```

---

# 6. First Filesystem Scan

After installing TruffleHog, create a small directory for testing.

## macOS / Linux

```bash
mkdir trufflehog-demo
cd trufflehog-demo
```

## Windows PowerShell

```powershell
mkdir trufflehog-demo
cd trufflehog-demo
```

Now scan the directory:

```bash
trufflehog filesystem .
```

TruffleHog will recursively scan the current directory for supported secret types.

If TruffleHog finishes without an installation or execution error, the installation is working correctly.

---

# Platform Overview

| Platform | Recommended Installation | Alternative |
|---|---|---|
| macOS | Homebrew | Docker |
| Windows | Precompiled Binary | Docker |
| Linux | Official Install Script | Docker |

The overall setup can therefore be summarized as:

```text
                    TruffleHog
                        │
          ┌─────────────┼─────────────┐
          │             │             │
        macOS         Windows        Linux
          │             │             │
      Homebrew         Binary    Install Script
          │             │             │
          └─────────────┼─────────────┘
                        │
                      Docker
               (cross-platform)
```

---

## Official Resources

- TruffleHog GitHub Repository:  
  https://github.com/trufflesecurity/trufflehog

- TruffleHog Releases:  
  https://github.com/trufflesecurity/trufflehog/releases

- Truffle Security Documentation:  
  https://trufflesecurity.com/docs/

- Homebrew:  
  https://brew.sh/

---

> **Security Notice:** Only scan repositories, directories, systems, and accounts that you own or have explicit permission to analyze. For exercises and demonstrations, use dedicated test repositories and test credentials instead of real production secrets.