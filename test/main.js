function main()
{
    // _isSame: Helper method to determine if two things are equal
    // Important: Two NaN values should be considered equal
    var _isSame = function(a, b) {
        if (_.isNaN(a) && _.isNaN(b) )
            return true
        return _.isEqual(a,b)
    }

    var _toString = function (any) {
        return JSON.stringify(any)
    }

    // _test: Helper method because I can't test uno with uno (yet!)
    var test = function (unotest, expected) {

        var result;
        try { result = eval(unotest) }
        catch (e) { result = e}
        var pass = _isSame(result, expected)
        var message = "Test " + name + (pass ? "passed" : "failed") + ": " + unotest + " == " + _toString(expected) + (pass ? "" : " [result: " + result + "]")
        var style = (pass ? "color:green" : "color:red")
        $("body").append("<div style='" + style + "'>" + message + "</div>");
        return pass;
    }

    // General tests
    test( "_.isString(uno.VERSION)", true)

    // Function tests
    test( "uno(Math.round, [1.5], 2)", true);
    test( "uno('Math.{fn}', Math.round, [2.1], 2)", true)
    test( "uno('Math.{fn}({args}), result: {result}, expected: {expected}', Math.round, [1.5], 2)", true)

    // Object tests
    var obj = {name: "Evan", age: function(){return 27;}, weight: 160};
    test( "uno(obj, obj.age, [], 27)", true );
    test( "uno('Person.age == {expected}', obj, obj.age, [], 27)", true );

    // Date object tests
    var date = new Date("October 31, 2012")
    test( "uno('date.getFullYear() == {expected}', date, date.getFullYear, [], 2012);", true );
}
