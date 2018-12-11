# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2018-11-12
### Added
- \#27: Added a `removeDuplicates` option which if set to `true` removes new duplicate items when they are loaded.

## [2.3.0] - 2018-09-24
### Added
- \#25: Added a `lazyloaderreset` event. This event is triggered before a reset request is made.

## [2.2.6] - 2018-09-20
### Fixed
- \#23: The list and its ancestors are now made visible while calculating its height in order to get the list's correct height. This fixes the issue that causes infinite requests to be sent if the list is invisible.

## [2.2.5] - 2018-09-19
### Fixed
- \#21: Fixed event requests overriding the results of a request made by a reset action. Event requests are now halted while a reset request is in progress.

## [2.2.4] - 2018-06-25
### Fixed
- \#19: The options as they are at the time of making the request are now used, rather than those at the time of sending the request. This in order to prevent timing issues that occur when an older request is returned before the new request is sent.

## [2.2.3] - 2018-06-25
### Fixed
- <s>\#19: Truly fixed. The options as they are at the time of making the request are now used, rather than those at the time of sending the request. This in order to prevent timing issues that occur when an older request is returned before the new request is sent.</s>

## [2.2.2] - 2018-06-25
### Fixed
- <s>\#19: The options as they are at the time of making the request are now used, rather than those at the time of sending the request. This in order to prevent timing issues that occur when an older request is returned before the new request is sent.</s>

## [2.2.1] - 2018-05-03
### Fixed
- \#17: Fixed `postData` and `ajaxSettings` defaults being overwritten when a request is made.

## [2.2.0] - 2018-03-30
### Added
- \#13: Added a `searchTimeout` option that is used to prevent requests from being needlessly sent if the `searchQuery` option is adjusted in quick succession. 

### Fixed 
- \#14: Fixed all items being loaded on initialization.

## [2.1.0] - 2018-03-28
### Fixed
- \#7: The plugin defaults are no longer being overwritten by the options during creation.
- Fixed incorrect url to the plugin within the `sample.html`.
- \#9: More items are now correctly loaded even if the scroll container isn't the window. 

### Added
- \#11: Added an `ajaxSettings` option. This option deprecates the `ajaxType` and `postData` options, which will be removed in a future version.

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