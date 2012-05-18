     _ _ ___ ___
    | | |   | . |
    |___|_|_|___|

## Uno: The simplest unit testing framework possible! ##

* One file `uno.js`
* One function `uno`
* No dependencies
* Results are printed to console.log

## How to test _functions_ ##

#### Example: Math.round function: ####
    
    uno(Math.round, [1.5], 2)
    
Output:

       logs:  "Uno test passed: round(1.5) == 2"
    returns:  true

Usage: 

    uno(name, fn, args, expected)

* `name` (optional) The name of the test. Excepts {inputs}, see below.
* `fn` The function to test
* `args` A list of arguments passed to `fn`
* `expected` What `fn(args)` should return

## How to test _methods_ ##

#### Example: Date object: ####

    var date = new Date("October 31, 2012");
    uno(date, date.getFullYear, [], 2012)

Output:

       logs:  "Uno test passed: object.getFullYear() == 2012"
    returns:  true

Usage:

    uno(name, object, method, args, expected)

* `name` (optional) The name of the test. Excepts {inputs}, see below.
* `object` The object to test
* `method` The method to test (in the context of `object`)
* `args` A list of arguments passed to `method`
* `expected` What `object.method(args)` should return



## {inputs} ##

All `name` options support {input} strings. Here is a full list:

    {method}             // alias: {function} {fn} {f}
    {args}               // alias: {arguments} {input} {in}
    {result}             // alias: {output} {out}
    {expected}

#### Example: Math.round function with custom name

    uno('Math.{fn}({args}), result: {result}, expected: {expected}', Math.round, [1.5], 2)

Output:

       logs:  "Uno test passed: Math.round(1.5), result: 2, expected: 2]"
    returns:  true

#### Example: Date object with a custom name: ####

    var date = new Date("October 31, 2012");
    uno('date.{method}({args}) == {expected}', date, date.getFullYear, [], 2012)

Output:

       logs:  "Uno test passed: date.getFullYear() == 2012"
    returns:  true





#### Full {input} list ####


## How to test _values_ ##
_(Almost done coding this)_

## How to profile ##
_(Still coding this one)_

## But wait... there is more! ##

* Uno hooks into other unit testing frameworks and does the right thing to make them work too.
* Uno auto names tests using the function name and arguments

## Supported unit testing frameworks ##

* qunit (close to finished)
* fireunit (close to finished)
* junit (just starting support)

## Install by source ##

* [uno.js](https://raw.github.com/evanmoran/uno/master/uno.js)

## Install to node ##

    npm install uno
    
## Usage in node ##

    uno = require('uno')
    
    uno(Math.round, [1.5], 2)      // logs: "Uno test passed: round(1.5) == 2"
    
   
    
    
