# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-12-23

### REMOVED

- cookiecutter template from this repository 
- `react-router-dom` in favor for `react-router`
- nautilus/nds library

### CHANGED

- node version to 22
- webpack files to `.ts` with correct typings
- ReactJS to v19
- React router to v7
- material library to v6

## [1.0.17] - 2024-10-15

### CHANGED

- Updated `eslintignore` with comments for justification

## [1.0.16] - 2024-10-02

### ADDED

- `NODE_ENV` to determine the specific webpack-{env} to build in the docker build stage

### FIXED

- eslint npm script not running due to single quotes

## [1.0.15] - 2024-09-12

### CHANGED

- Added `tests` and `test` to `.eslintignore`

## [1.0.14] - 2024-09-10

### FIXED

- Fixed glob for eslint command in `package.json`

### REMOVED

- gitleaks linting

## [1.0.13] - 2024-07-24

### ADDED

- Added `wget` support to healthcheck command in `Dockerfile-dev`

## [1.0.12] - 2024-07-19

### ADDED

- `cookiecutter-replay.json` to capture cookiecutter args for replaying to update repo

## [1.0.11] - 2024-07-01

### REMOVED

- eslint indentation rule as it clashes with prettier

## [1.0.10] - 2024-04-25

### CHANGED

- bumped nginx version in dev Dockerfile to 1.25

## [1.0.9] - 2024-04-24

### CHANGED

- nautilus nds package to use 0.1.5 instead of 0.1.4

## [1.0.8] - 2024-04-12

### CHANGED

- improved cookiecutter pre-gen hook error messages

### ADDED

- regex for node version

## [1.0.7] - 2024-03-26

### ADDED

- ability to load `.jpg, .png, .jpeg, .svg .gif` static files

### CHANGED

- eslint to remove `/*/**` as it was throwing parsing errors for jpg/png/jpeg/svg/gif extensions. The change still works as per normal

## [1.0.6] - 2024-03-20

### CHANGED

- `nginx.conf` to remove upstream ui_server

## [1.0.5] - 2024-03-19

### CHANGED

- webpack config of development to add `publicPath` parameter to fix nested pages refresh throwing 404

## [1.0.4] - 2024-03-12

### CHANGED

- Updated changlog_config.yml

## [1.0.3] - 2024-03-01

### ADDED

- .dockerignore file

### FIXED

- `webpack.prod` and `webpack.staging`, changed the build output path to match dockerfiles

### REMOVED

- Removed jscpd

## [1.0.2] - 2024-02-27

### ADDED

- added Dockerfile-dev for local running or testing

## [1.0.1] - 2024-02-15

### ADDED

- differentiate cookiecutter instructions from DIC/site

## [1.0.0] - 2024-02-13

### ADDED

- initial mfe app template
