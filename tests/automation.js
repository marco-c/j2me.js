/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* vim: set shiftwidth=4 tabstop=4 autoindent cindent expandtab: */

casper.on('remote.message', function(message) {
    this.echo(message);
});

casper.options.waitTimeout = 35000;

casper.test.begin("unit tests", 6, function(test) {
    casper
    .start("http://localhost:8000/index.html")
    .waitForText("DONE", function() {
        test.assertTextExists("DONE: 4516 pass, 0 fail, 162 known fail, 0 unknown pass", "run unit tests");
    });

    casper
    .thenOpen("http://localhost:8000/index.html?main=tests/isolate/TestIsolate&logLevel=info")
    .waitForText("DONE", function() {
        test.assertTextExists("I m\nI a ma\nI 2\nI ma\nI 2\nI 1 isolate\nI Isolate ID correct\nI 4\nI 5\nI 1 isolate\nI ma\nI ma\nI 3 isolates\nI 1 m1\nI 2 m2\nI 4\nI 5\nI ma\nI 1 isolate\nI Isolates terminated\nI r mar\nI 2\nI mar\nI c marc\nI 2\nI marc\nI Main isolate still running");
    });

    casper
    .thenOpen("http://localhost:8000/index.html?main=com/sun/midp/main/MIDletSuiteLoader&midletClassName=tests/alarm/MIDlet1&jad=tests/midlets/alarm/alarm.jad")
    .waitForText("Hello World from MIDlet2", function() {
        test.assert(true);
    });

    casper
    .thenOpen("http://localhost:8000/tests/fstests.html")
    .waitForText("DONE", function() {
        test.assertTextExists("DONE: 106 PASS, 0 FAIL", "run fs.js unit tests");
    });

    casper
    .thenOpen("http://localhost:8000/index.html?midletClassName=tests.sms.SMSMIDlet&main=com/sun/midp/main/MIDletSuiteLoader", function() {
        this.waitForText("START", function() {
            this.waitForSelector("#sms_text", function() {
                this.waitForSelector("#sms_addr", function() {
                    this.waitForSelector("#sms_receive", function() {
                        this.sendKeys("#sms_text", "Prova SMS", { reset: true });
                        this.sendKeys("#sms_addr", "+77777777777", { reset: true });
                        this.click("#sms_receive");

                        this.waitForText("DONE", function() {
                            test.assertTextDoesntExist("FAIL");
                        });
                    });
                });
            });
        });
    });

    // Graphics tests

    [ "gfx/CanvasTest" ].forEach(function(testName) {
        casper
        .thenOpen("http://localhost:8000/index.html?main=com/sun/midp/main/MIDletSuiteLoader&midletClassName=" + testName)
        .waitForText("PAINTED", function() {
            this.waitForSelector("#canvas", function() {
                var got = this.evaluate(function(testName) {
                    var dataURL = document.getElementById("canvas").toDataURL();

                    var img = new Image();
                    img.src = "tests/" + testName + ".png";

                    img.onload = function() {
                        var canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        canvas.getContext("2d").drawImage(img, 0, 0);
                        if (canvas.toDataURL() == dataURL) {
                            console.log("DONE");
                        } else {
                            console.log(canvas.toDataURL());
                            console.log(dataURL);
                            console.log("FAIL");
                        }
                    };

                    img.onerror = function() {
                        console.log("Error while loading test image");
                        console.log("FAIL");
                    };
                }, testName);

                this.waitForText("DONE", function() {
                    test.assertTextDoesntExist("FAIL");
                });
            });
        });
    });

    casper
    .run(function() {
        test.done();
    });
});
