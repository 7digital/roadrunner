/* global $ */
/* global chain */
/* global server */

$('echo hello')
	.and('echo world');

chain('echo running on ' + server);