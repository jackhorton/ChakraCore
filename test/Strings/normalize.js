//-------------------------------------------------------------------------------------------------------
// Copyright (C) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

testRunner.runTests([
    {
        name: "Correct errors are thrown for bad calls",
        body() {
            assert.throws(() => String.prototype.normalize.call("", "asd"), RangeError);
            assert.throws(() => String.prototype.normalize.call(), TypeError);
            [undefined, null].forEach((that) => {
                assert.throws(() => String.prototype.normalize.call(that), TypeError);
            });
            assert.throws(() => new String.prototype.normalize("nfc"), TypeError);
            ["a\uDC00b", "a\uD800b"].forEach((malformedString) => {
                assert.throws(() => malformedString.normalize(), RangeError);
            })
        }
    },
    {
        name: "String-coercibles can be normalized",
        body() {
            assert.areEqual("5", String.prototype.normalize.call(5));
            assert.areEqual("function String() { [native code] }", String.prototype.normalize.call(String));
            const fooCode = "function foo() { return 3; }";
            eval(fooCode);
            assert.areEqual(fooCode, String.prototype.normalize.call(foo));
        }
    },
    {
        name: "NFC normalization tests",
        body() {
            // First, make sure that no argument is treated as NFC
            assert.areEqual("", "".normalize(), "Empty string normalizes to itself");
            assert.areEqual("\u00C4ffin", "\u00C4ffin".normalize());
            assert.areEqual("\u00C4\uFB03n", "\u00C4\uFB03n".normalize());
            assert.areEqual("Henry IV", "Henry IV".normalize());
            assert.areEqual("Henry \u2163", "Henry \u2163".normalize());

            // Then, make sure all NFC-compatible arguments are treated the same
            [undefined, "NFC"].forEach((nfc) => {
                assert.areEqual("", "".normalize(nfc), "Empty string normalizes to itself");
                assert.areEqual("\u00C4ffin", "\u00C4ffin".normalize(nfc));
                assert.areEqual("\u00C4\uFB03n", "\u00C4\uFB03n".normalize(nfc));
                assert.areEqual("Henry IV", "Henry IV".normalize(nfc));
                assert.areEqual("Henry \u2163", "Henry \u2163".normalize(nfc));
            });
        }
    },
    {
        name: "NFD normalization tests",
        body() {
            assert.areEqual("A\u0308ffin", "\u00C4ffin".normalize("NFD"));
            assert.areEqual("A\u0308\uFB03n", "\u00C4\uFB03n".normalize("NFD"));
            assert.areEqual("Henry IV", "Henry IV".normalize("NFD"));
            assert.areEqual("Henry \u2163", "Henry \u2163".normalize("NFD"));
        }
    },
    {
        name: "NFKC normalization tests",
        body() {
            assert.areEqual("\u00C4ffin", "\u00C4ffin".normalize("NFKC"));
            assert.areEqual("\u00C4ffin", "\u00C4\uFB03n".normalize("NFKC"));
            assert.areEqual("Henry IV", "Henry IV".normalize("NFKC"));
            assert.areEqual("Henry IV", "Henry \u2163".normalize("NFKC"));
        }
    },
    {
        name: "NFKD normalization tests",
        body() {
            assert.areEqual("A\u0308ffin", "\u00C4ffin".normalize("NFKD"));
            assert.areEqual("A\u0308ffin", "\u00C4\uFB03n".normalize("NFKD"));
            assert.areEqual("Henry IV", "Henry IV".normalize("NFKD"));
            assert.areEqual("Henry IV", "Henry \u2163".normalize("NFKD"));
        }
    },
    {
        name: "Normalization of property strings",
        body() {
            const o = { blah: "abc" }
            Object.defineProperty(o, 'hello', {
                get: function() { return 42; },
                set: function() { },
                enumerable: true
            });

            for (const prop in o) {
                assert.areEqual(prop, prop.normalize());
            }
        }
    }
]);
