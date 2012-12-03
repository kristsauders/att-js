call("+1" + number);
record(".", {
    beep: false,
    timeout: 1,
    silenceTimeout: 1,
    maxTime: 10
});
say(messageToSay);
