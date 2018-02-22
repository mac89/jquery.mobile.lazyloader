## LazyLoader Widget for jQuery Mobile

Lazyloading (i.e. loading the content as it's needed during a scroll of a listview or similar control) is a great way to optimize the performance of any app that contains a list of 50 or more items.  With the LazyLoader Widget for jQuery Mobile, you can easily lazyload any listview without having to write a bunch of custom code to accomplish it.

Note: This is only the client-side part of the lazyloading solution.  It requires a server-side resource that returns a simple JSON formatted string.  Details and examples can be found below. 

### Contents

* [Requirements](#Requirements)
* [Usage](#Usage)
  * [Filterable](#Filterable)
  * [Server request](#Server request)
  * [Server response](#Server response)
* [Options](#Options)
* [Functions](#Functions)
  * [loadMore](#loadMore)
  * [reset](#reset)
* [Events](#Events)
  * [lazyloaderdoneloading](#lazyloaderdoneloading)
  * [lazyloaderalldone](#lazyloaderalldone)
  * [lazyloaderbeforerender](#lazyloaderbeforerender)
  * [lazyloadererror](#lazyloadererror)
* [Sample](#Sample)    

### Requirements

* jQuery (Tested with v2.2.4)
* jQuery Mobile (Tested with v1.4.5)
* ICanHaz (Tested with v0.10.3)
* Server-side code to handle the AJAX requests

### Usage

Include the following files:

```html
<link rel="stylesheet" href="http://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.css"/>
<script src="http://code.jquery.com/jquery-2.2.4.min.js"></script>
<script src="http://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ICanHaz.js/0.10.3/ICanHaz.min.js"></script>
<script src="dist/jquery.mobile.lazyloader-2.0.0.min.js"></script>
```

Include a template in the `<head>`:
```html
<script id="user" type="text/html">
	<li>
		<p class="name">Hello I'm {{ name }}</p>
	</li>
</script>
```

Add a list and optionally an element that indicates progress is going on:

```html
<ul id="myListView"></ul>
<div id="myProgress" style="position: fixed; top: 50%; left: 50%; display: none">Loading...</div>
```

Initialize the widget with the url to get the data from and the id of the template:

```JavaScript
$(function() {
	// Initialize the lazyloader widget
	$("#myListView").lazyloader({
		url: 'http://server.com', 
		templateId: "user", 
		$progress: "#myProgress"
	});
});
```

#### Filterable

If you are using the `filterable` widget in combination with this widget, the default behaviour is changed to filtering server side. The `searchQuery` option is set to the filter input when its content is changed. This will cause the `reset` function with the modified `searchQuery` option to be called. You are responsible for applying the filter server-side.

#### Server request

The request made out to the server will contain the following data:

- __retrieve__: {number} The number of items to be retrieved.
- __retrieved__: {number} The current number of retrieved items.
- __reset__: {boolean} Whether or not the server data should be reset.
- __searchQuery__: {string} The search query to filter with.

#### Server response

The server response is expected to be in a JSON format with the mandatory `items` key that must contain an array of objects, each representing a list item to be rendered. 

```json
{
	"items": [
		{"name": "John"}
	]
}
```

### Options
<table>
	<tr>
	<th>Option</th><th>Default</th><th>Required</th><th>Purpose</th>
	</tr>
		<tr>
    		<td>url</td>
    		<td>Empty</td>
    		<td>Yes</td>
    		<td>This specifies the URL of the server-side resource to which the AJAX post should be sent.</td>
    	</tr>
	<tr>
		<td>templateId</td>
		<td>Empty</td>
		<td>Yes</td>
		<td>The id of the ICanHaz template used to create list items for the loaded items.</td>
	</tr>
	<tr>
		<td>$progress</td>
		<td>Empty</td>
		<td>No</td>
		<td>The selector of the jQuery element that is to be shown or hidden when a request is made.</td>
	</tr>
	<tr>
		<td>eventTimeout</td>
		<td>100</td>
		<td>No</td>
		<td>The timeout used before attempting to load more items when it is triggered by either the `scrollstart`, `scrollstop`, or `wheel` event.</td>
	</tr>
	<tr>
		<td>threshold</td>
		<td>100</td>
		<td>No</td>
		<td>This specifies the threshold in pixels for how close to the bottom of the page should the widget get before loading more items.</td>
	</tr>
	<tr>
		<td>retrieve</td>
		<td>20</td>
		<td>No</td>
		<td>This specifies how many items should be retrieved with each lazy loading ajax call</td>
	</tr>
	<tr>
		<td>retrieved</td>
		<td>0</td>
		<td>No</td>
		<td>This specifies the number of items that are currently loaded</td>
	</tr>
	<tr>
		<td>searchQuery</td>
		<td>Empty</td>
		<td>No</td>
		<td>The search query that is posted along in the request. Changing this option will trigger the `reset` function.</td>
	</tr>
	<tr>
		<td>ajaxType</td>
		<td>POST</td>
		<td>No</td>
		<td>The ajax request type. Can be either GET or POST.</td>
	</tr>
</table>

### Functions

#### loadMore

Loads more items.

```JavaScript
$("#myListView").lazyloader("loadMore", timeout);
```

- __timeout__: {number} The timeout before a request is sent. Defaults to the `loadMoreTimeout` option.

#### reset

Empties the list, sets the `retrieved` option back to `0` and sends a request for more items to the server, while also indicating a reset has been performed.

```JavaScript
$("#myListView").lazyloader("reset", timeout);
```

- __timeout__: {number} The timeout before a request is sent. Defaults to the `loadMoreTimeout` option.

### Events

The lazyloader triggers several events during certain operations. Here are examples of how to listen for the events:

#### lazyloaderdoneloading

Raised when a request for more items is completed.

```JavaScript
$("#myListView").on("lazyloaderdoneloading", function ( evt ){ });
```

- __evt__: {JQuery.Event} The jQuery event.

#### lazyloaderalldone

Raised when all items have been loaded. No more requests will be sent after this event has been raised.

```JavaScript
$("#myListView").on("lazyloaderalldone", function ( evt ){ });
```

- __evt__: {JQuery.Event} The jQuery event.

#### lazyloaderbeforerender

Raised before the loaded items are rendered. This allows you to modify the data before it's rendered in the list.

```JavaScript
$("#myListView").on("lazyloaderbeforerender", function ( evt, items ){ });
```

- __evt__: {JQuery.Event} The jQuery event.

- __items__: {Object[]} An array of loaded items.

#### lazyloadererror

Raise when an error occurred with the ajax request or when parsing the result

```JavaScript
$("#myListView").on("lazyloadererror", function ( evt, error ){ });
```

- __evt__: {JQuery.Event} The jQuery event.

- __error__: {Object} An object containing information about the error that occured.
 
	- __errorCode__: {number} The error code. 
	
		_Error codes_
		- __1__: An error occurred with the request.
		- __2__: An error occurred parsing the response data. 
	
	- __errorData__: {*} The data offering more information about the error.
	
### Sample

Navigate to the `jquery.mobile.lazyloader` directory and run the following command in a console to start the server:

`node samples\server\server.js`

Open the `samples\sample.html` page in your browser of choice.