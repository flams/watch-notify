/**
* @license watch-notify https://github.com/flams/watch-notify
*
* The MIT License (MIT)
*
* Copyright (c) 2014 Olivier Scherrer <pode.fr@gmail.com>
*/
var WatchNotify = require("../index");

describe("WatchNotify", function () {

    it("should be a constructor function", function () {
        expect(typeof WatchNotify).toBe("function");
    });

    describe("watch", function () {

        var watchNotify = null,
            testTopic = "testTopic";

        beforeEach(function() {
            watchNotify = new WatchNotify();
        });

        it("should add an observer", function () {
            var spy = jasmine.createSpy("callback");
                handler = null;

            expect(watchNotify.hasObserver(handler)).toBe(false);
            handler = watchNotify.watch(testTopic, spy);

            expect(watchNotify.hasObserver(handler)).toBe(true);

        });

        it("should add an observer on a topic that is a number", function () {
            var spy = jasmine.createSpy("callback");
            handler = null;

            expect(watchNotify.hasObserver(handler)).toBe(false);
            handler = watchNotify.watch(0, spy);

            expect(watchNotify.hasObserver(handler)).toBe(true);

        });

        it("should add an observer with scope", function () {
            var spy = jasmine.createSpy("callback");
                handler = null;

            expect(watchNotify.hasObserver(handler)).toBe(false);
            handler = watchNotify.watch(testTopic, spy, this);

            expect(watchNotify.hasObserver(handler)).toBe(true);
        });

        it("should add multiple observers with or without scopes", function () {
            var spy1 = jasmine.createSpy("callback"),
                spy2 = jasmine.createSpy("callback"),
                handler1 = null,
                handler2 = null,
                thisObj = {},
                testTopic = "testTopic";

            handler1 = watchNotify.watch(testTopic, spy1);
            handler2 = watchNotify.watch(testTopic, spy2, thisObj);
            expect(watchNotify.hasObserver(handler1)).toBe(true);
            expect(watchNotify.hasObserver(handler2)).toBe(true);

        });

        it("can remove an observer", function () {
            var spy = jasmine.createSpy("callback"),
            handler;

            handler = watchNotify.watch(testTopic, spy);
            expect(watchNotify.unwatch(handler)).toBe(true);

            expect(watchNotify.hasObserver(handler)).toBe(false);
            expect(watchNotify.unwatch(handler)).toBe(false);
        });

        it("should remove multiple observers", function () {
            var spy1 = jasmine.createSpy("callback"),
                spy2 = jasmine.createSpy("callback"),
                handler1 = null,
                handler2 = null,
                thisObj = {},
                testTopic = "testTopic";

            handler1 = watchNotify.watch(testTopic, spy1);
            handler2 = watchNotify.watch(testTopic, spy2, thisObj);
            expect(watchNotify.unwatch(handler1)).toBe(true);
            expect(watchNotify.unwatch(handler2)).toBe(true);
            expect(watchNotify.unwatch(handler1)).toBe(false);
            expect(watchNotify.unwatch(handler2)).toBe(false);
        });

        it("shouldn't add observer if wrong parameter count or type", function () {
            expect(watchNotify.watch()).toBe(false);
            expect(watchNotify.watch("topic")).toBe(false);
            expect(watchNotify.watch(function(){}, "topic")).toBe(false);
            expect(watchNotify.watch("", {})).toBe(false);
        });

        it("should remove all observers", function () {
            var handler1 = null,
                handler2 = null;

            handler1 = watchNotify.watch("test", function(){});
            handler2 = watchNotify.watch("test2", function(){});

            expect(watchNotify.unwatchAll()).toBe(true);

            expect(watchNotify.hasObserver(handler1)).toBe(false);
            expect(watchNotify.hasObserver(handler2)).toBe(false);
        });

        it("should remove all observers from one topic", function () {
            var handler1 = null,
                handler2 = null;

            handler1 = watchNotify.watch("test", function(){});
            handler2 = watchNotify.watch("test2", function(){});
            handler3 = watchNotify.watch("test2", function(){});

            expect(watchNotify.unwatchAll("test2")).toBe(true);

            expect(watchNotify.hasObserver(handler1)).toBe(true);
            expect(watchNotify.hasObserver(handler2)).toBe(false);
            expect(watchNotify.hasObserver(handler3)).toBe(false);
        });

        it("should tell if a topic is already watched", function () {
            var topic = "topic",
                handler;

            handler = watchNotify.watch("topic", function () {});
            expect(watchNotify.hasTopic("topic")).toBe(true);
            expect(watchNotify.hasTopic("notopic")).toBe(false);
            watchNotify.unwatch(handler);
            expect(watchNotify.hasTopic("topic")).toBe(false);
        });

        it("should watch an event on a topic only once", function () {
            var handle = [],
                spy = jasmine.createSpy(),
                scope = {};

            spyOn(watchNotify, "watch").andReturn(handle);
            spyOn(watchNotify, "unwatch");

            expect(watchNotify.once("test", spy, scope)).toBe(handle);

            expect(watchNotify.watch).toHaveBeenCalled();
            expect(watchNotify.watch.mostRecentCall.args[0]).toBe("test");
            expect(typeof watchNotify.watch.mostRecentCall.args[1]).toBe("function");
            expect(watchNotify.watch.mostRecentCall.args[2]).toBe(watchNotify);

            watchNotify.watch.mostRecentCall.args[1].call(watchNotify, 1, 2, 3);

            expect(spy).toHaveBeenCalledWith(1, 2, 3);
            expect(spy.mostRecentCall.object).toBe(scope);

            expect(watchNotify.unwatch).toHaveBeenCalledWith(handle);
        });

    });

    describe("notify", function () {

        var watchNotify = null,
            testTopic = "testTopic";

        beforeEach(function () {
            watchNotify = new WatchNotify();
        });

        it("should notify observer", function () {
            var spy = jasmine.createSpy("callback");

            watchNotify.watch(testTopic, spy);
            expect(watchNotify.notify(testTopic)).toBe(true);
            expect(spy.wasCalled).toBe(true);
        });

        it("should notify observer on topics that are numbers", function () {
            var spy = jasmine.createSpy("callback");

            watchNotify.watch(0, spy);
            expect(watchNotify.notify(0)).toBe(true);
            expect(spy.wasCalled).toBe(true);

        });

        it("should notify observer in scope", function () {
            var spy = jasmine.createSpy("callback");
                thisObj = {};

            watchNotify.watch(testTopic, spy, thisObj);
            expect(watchNotify.notify(testTopic)).toBe(true);
            expect(spy.wasCalled).toBe(true);
            expect(spy.mostRecentCall.object).toBe(thisObj);
        });

        it("should pass parameters", function () {
            var spy = jasmine.createSpy("callback");
                post = {x:10};

            watchNotify.watch(testTopic, spy);
            watchNotify.notify(testTopic, post);

            expect(spy.mostRecentCall.args[0]).toBe(post);
        });

        it("should pass multiple parameters", function () {
            var spy = jasmine.createSpy("callback"),
                param1 = "param1",
                param2 = "param2";

            watchNotify.watch(testTopic, spy);
            watchNotify.notify(testTopic, param1, param2);

            expect(spy.mostRecentCall.args[0]).toBe(param1);
            expect(spy.mostRecentCall.args[1]).toBe(param2);
        });

        it("should notify all observers", function () {
            var spy1 = jasmine.createSpy("callback"),
                spy2 = jasmine.createSpy("callback"),
                thisObj = {},
                testTopic = "testTopic";

            watchNotify.watch(testTopic, spy1);
            watchNotify.watch(testTopic, spy2, thisObj);
            watchNotify.notify(testTopic, "test");
            expect(spy1.wasCalled).toBe(true);
            expect(spy2.wasCalled).toBe(true);
            expect(spy2.mostRecentCall.object).toBe(thisObj);
        });

        it("should return false when notifying on empty topics", function () {
            expect(watchNotify.notify("fake")).toBe(false);
        });

    });

    describe("MiscBehavior", function () {

        var watchNotify = null,
            order = null;

        beforeEach(function () {
            watchNotify = new WatchNotify();
            order = [];

            watchNotify.watch("topic", function () {
                order.push("observer1");
            });
            watchNotify.watch("topic", function () {
                order.push("observer2");
            });
            watchNotify.watch("topic", function () {
                order.push("observer3");
            });

        });

        it("should call observers in the order they are added", function () {
            watchNotify.notify("topic");
            expect(order[0]).toBe("observer1");
            expect(order[1]).toBe("observer2");
            expect(order[2]).toBe("observer3");

        });

        it("should continue notifying observers even if one of them fails to execute", function () {
            var errFunc = function () {
                error++;
            };

            watchNotify.watch("topic", errFunc);

            watchNotify.watch("topic", function () {
                order.push("observer5");
            });

            watchNotify.notify("topic");

            expect(order[3]).toBe("observer5");
        });

        it("should accept that observers are removed on the fly", function () {

            var obs = watchNotify.watch("topic", function () {
                order.push("observer4");
                watchNotify.unwatch(obs);
            });

            watchNotify.watch("topic", function () {
                order.push("observer5");
            });

            watchNotify.notify("topic");

            expect(order[3]).toBe("observer4");
            expect(order[4]).toBe("observer5");

            watchNotify.notify("topic");

            expect(order[8]).toBe("observer5");

        });

    });

    describe("Isolated", function () {

        var watchNotify1 = new WatchNotify(),
            watchNotify2 = new WatchNotify(),
            testTopic = "testTopic";

        it("should add observer to only one watchNotify", function () {
            var handler = watchNotify1.watch(testTopic, function () {});
            expect(watchNotify2.hasObserver(handler)).toBe(false);
        });

        it("should notify only one watchNotify", function () {
            expect(watchNotify2.notify(testTopic)).toBe(false);
        });

    });


});
