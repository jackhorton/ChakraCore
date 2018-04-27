//-------------------------------------------------------------------------------------------------------
// Copyright (C) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

const argv = (function () {
    if (typeof WScript !== "undefined") {
        return WScript.Arguments;
    } else if (typeof process !== "undefined") {
        return process.argv;
    } else {
        return [];
    }
})();

function formatMessage(expected, comparisonText, actual, assertMessage) {
    return `Result ${actual} does not ${comparisonText} expected value ${expected}\nAssert message: ${assertMessage}`
}

function assert(condition, message) {
    if (condition === false) {
        throw new Error(message);
    }
}

assert.ok = assert;

assert.equal = function equal(expected, actual, message) {
    assert(expected == actual, formatMessage(expected, "equal", actual, message));
};

assert.strictEqual = function strictEqual(expected, actual, message) {
    assert(expected === actual, formatMessage(expected, "strict-equal", actual, message));
}

assert.throws = function throws(test, type, message) {
    let threw = true;
    try {
        test();
        threw = false;
    } catch (e) {
        if (!(e instanceof type)) {
            assert(false, `Expected test to throw ${type.name}, but it actually threw ${e.name}`);
        }
    }

    if (!threw) {
        assert(false, "Test did not throw");
    }
}

function runTests(tests) {
    const passed = [];
    const failed = [];

    let only = undefined;
    const onlyArgs = argv.filter((arg) => arg.substring(0, 6) === "-only:");
    if (onlyArgs.length >= 1) {
        // this allows passing -only:1 -only:2 to mean the same thing as -only:1,2
        only = onlyArgs.map((arg) => arg.substring(0, 6)).join(",").split(",");
    }

    tests.forEach((test, index) => {
        assert.equal("string", typeof test.name, `Test ${index} does not have valid name`);
        assert.equal("function", typeof test.body, `Test ${index} does not have valid body`);

        if (only && !only.includes(test.name) && !only.includes(index.toString())) {
            return;
        }

        try {
            test.body();
            passed.push(Object.assign({}, test, { index }));
        } catch (error) {
            failed.push(Object.assign({}, test, { index, error }));
        }
    });

    function printTestSummary(testObject, passed) {
        let formatted = `Test ${testObject.index} - ${testObject.name}`;
        if (!passed) {
            formatted = `${formatted}\n\t${testObject.error.stack.split("\n").join("\n\t")}`
        }
        console.log(formatted);
    }

    if (argv.includes("-verbose")) {
        console.log("-".repeat(80));
        console.log(`Passed ${passed.length}`);
        if (passed.length > 0) {
            passed.forEach((pass) => printTestSummary(pass, true));
        }
        console.log("-".repeat(80));
        console.log(`Failed ${failed.length}`);
        if (failed.length > 0) {
            failed.forEach((fail) => printTestSummary(fail, false));
        }
        console.log("-".repeat(80));
    } else if (failed.length > 0) {
        console.log(`Failed ${failed.length}`);
        failed.forEach((fail) => printTestSummary(fail, false));
    } else {
        console.log("pass");
    }
}

export { assert, runTests };
