# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [2.0.3] - 2018-03-27
### Fixed
- \#5: Fixed an issue that caused the plugin to possibly send an unnecessary request if the `$.mobile.hideUrlBar` JQM setting was set to `true`.
- Fixed incorrect url to the plugin within the `sample.html`.

## [2.0.2] - 2018-03-09
### Fixed
- \#3: Corrected an issue that caused the plugin not to load items on initialization if the `filter` option was set to `true` 
and the filter input value was empty.
- Fixed incorrect CHANGELOG.md dates. 
- Added `karma-results.xml` to .gitignore.
- Fixed the grunt dist task not generating the minified file.

## [2.0.1] - 2018-02-26
### Added
- The distribution files are to be committed now.

### Fixed
- Added correct npm API key to travis.yml.

### Changed
- The Travis build script now only checks if the distribution files have been correctly committed.

## [2.0.0] - 2018-02-26

### Added
- The `lazyloaderbeforerender` event has been added. This event is triggered just before items are rendered.
- The `searchQuery`, `postData` and `ajaxType` options.
- The data in the request now includes whether or not it should be reset and the searchQuery option value.
- Added support for the `jquery.mobile.filterable` widget.

### Changed 
- There is only one timeout option left: `eventTimeout`.
- The`moreUrl` option is now called `url`.
- The `progressDivId` option has been changed to `$progress` which can be any jQuery selector.
- The expected response JSON format.
- The sample has been changed to include a node js server. 
 
### Removed
- All templating engine support except for ICanHaz.
- All functions except for `loadMore` and `reset`.
- The`clearUrl` option.