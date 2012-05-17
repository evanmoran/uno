     _ _ ___ ___
    | | |   | . |
    |___|_|_|___|

The simplest unit testing framework possible:

* One file `uno.js`
* One function `uno`
* No dependencies
* Results output to console.log

It is also helpful!

* Uno hooks into other unit testing frameworks and does the right thing to make them work too.
* Uno auto names tests using the function name and arguments

Supported unit testing frameworks:

* qunit (in progress)
* fireunit (in progress)
* junit (in progress)

Install by source:

* [uno.js](https://raw.github.com/evanmoran/uno/master/uno.js)

Install to node:

    npm install uno
    
Usage in node:

    uno = require('uno')
    
    uno(Math.round, [1.5], 2)
    
   
    
    
