# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2017-02-22

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