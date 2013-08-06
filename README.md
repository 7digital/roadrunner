# Road Runner

[![Build Status](https://travis-ci.org/7digital/roadrunner.png?branch=master)](http://travis-ci.org/7digital/roadrunner)

## Introduction

It will run scripts on remote servers which can be passed configuration from a
yaml file to allow you to template scripts for use in different environments.

You can run the scripts on each server in series or in parallel.  Specifying
multiple scripts will run them all, but you can only provide a single config
file, so if those scripts all require configuration it must be combined.

If you attempt to run a script that acceses config but do not supply a config
then roadrunner will exit with an error before doing anything.

**Note** Accessing properties that are missing from config will result in
'undefined' in the command string (obviously!)

## Installation

**roadrunner has not been published yet - it will be soon when it's had**
**some more thorough internal usage - please run from a clone for now.**

Roadrunner is a node (>0.8) program and should be installed globally via `npm`

```
[sudo] npm install -qg roadrunner
```

Or you can run the most recent code:

```
git clone git://github.com/7digital/roadrunner.git
cd roadrunner
[sudo] npm link
```

**Note** if you are running roadrunner from a unix machine and targetting
windows server(s) you cannot use the path module to join paths as it may
result in  mixed forward slashes and backslashes.

## Getting Started

This example uses both config and the server global to demonstrate what is
available to running scripts.

`roadrunner --connections connections.yml --config config.yml script.js`

#### script.js

```javascript
$('echo hello')
  .and('echo im running on ' + server)
  .and('echo foo is ' + config.foo);
```

#### config.yml

```yaml
foo: bar
```

#### connections.yml

```yaml
servers:
    -
        port: 22
        user: "joe-bloggs"
        key: "~/id_rsa"
        host: foo1.acme.com
    -
        port: 22
        user: "joe-bloggs"
        key: "~/id_rsa"
        host: foo2.acme.com
```

This prints:

```
foo1.acme.com
	>>> echo hello
	<<< hello
	>>> echo im running on foo1.acme.com
	<<< im running on foo1.acme.com
	>>> echo foo is bar
	<<< foo is bar
foo2.acme.com
	>>> echo hello
	<<< hello
	>>> echo im running on foo2.acme.com
	<<< im running on foo2.acme.com
	>>> echo foo is bar
	<<< foo is bar
```

## Scripts

A simple little DSL is provided to wrap up any DOS commands in cleaner
syntax with simpler control flow.  Each script is parsed once per remote server
(and/or local) and the config, environment and the DSL are available to your
scripts and arranged to contain the correct values for the environment they are
running in.

You can test running any script locally as well as on remote server(s). Note
that running msdos commands over SSH only works reliably using WinSSHD.

``config`` - Object containing the parsed yaml config specified on the
commandline

``server`` - String containing the hostname of the server at runtime (or
"localhost")

### Command chains

You may create as many chains as you need in your scripts.  Each will be run
sequentially until completion or one chain fails to complete succesfully.

``$`` or ``chain`` - Function that takes a string or another function which
accepts a callback.  Returns a chain of commands, which you can add further
commands to. When supplied a string this is the command to run.  When provided
a function this is some javascript that will execute locally and should invoke
the supplied callback when done with an error as an argument.

``and`` - Function that takes a string or another function (same behaviour),
which should only run if the previous command exited successfully.

``or`` - Function that takes a string or another function (same behaviour),
which should only run if the previous command failed to exit successfully.

``always`` - Function that takes a string or another function (same behaviour),
which should always run.

``ok`` - Function that takes no arguments and indicates that the exit status of
the last command should be ignored.  I.E. roadrunner will continue to execute
subsequent chains even if the current one terminates with a failure status.

## Commandline Options

roadrunner can then be invoked with the following options

``--config`` - The path to a yaml file that contains script configuration
settings.

``--connections`` - The path to a yaml file that contains ssh connection
settings.

``--parallel`` -  Run your scripts on the targets in parallel

``--logger`` - A logger to use for formatting program output

``--help`` - Display this help

## Loggers

### Default (console) logger

By default the `console` logger is used.  This formats the output (escaping
newlines in command output for legibility) as you see above in the
example.

### Teamcity logger

This logger formats output using the Teamcity 7.x build script interaction
syntax.  When running in serial (default) it will update the progress bar with
the name of the server that the batch is being executed on.  When running in
parallel, it adds a flowId to the messages to keep the output of the different
servers organised properly.  (this currently does not work - teammity seems to
ignore this documented message parameter).

### Custom loggers

Custom loggers are expected to export an object with an `attach` property, which
is a function that takes a batch as its argument. The function will be called by
roadrunner immediately after the batch is created and gives you an opportunity
to attach handlers to interesting events to format output.


Batch Events

- starting
- target
- complete
- error

Target Events

- starting
- chain
- complete
- error

Chain Events

- command dispatching
- command complete
- complete
- error

## Hacking

I'm using Grunt for build automation, run `grunt setupdev` to install git
hooks. See the CONTRIBUTING document for details on the development workflow, I
like to adhere to.
