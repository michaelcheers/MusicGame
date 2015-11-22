/* global Bridge */

"use strict";

Bridge.define('MusicGame.App', {
    statics: {
        note: 0,
        maxNote: 3,
        noteName: null,
        blocking: false,
        numRight: 0,
        numWrong: 0,
        gameData: null,
        coinsFlag: false,
        coinsAmount: 0,
        clef: "treble",
        config: {
            init: function () {
                this.minNote = -8;
                this.noteNamesDor = ["Do", "Re", "Mi", "Fa", "So", "La", "Ti"];
                this.noteNamesLetter = ["C", "D", "E", "F", "G", "A", "B"];
                this.audio = Bridge.Array.init(7, null);
                this.staveImg = new Image();
                this.noteImg = new Image();
                this.lineImg = new Image();
                Bridge.ready(this.main);
            }
        },
        getnoteNames: function () {
            switch ((Bridge.cast(document.getElementsByName("buttonType")[0], HTMLSelectElement)).value) {
                case "letter": 
                    return MusicGame.App.noteNamesLetter;
                case "dor": 
                    return MusicGame.App.noteNamesDor;
            }
            throw new Bridge.ArgumentException("Problem");
        },
        main: function () {
            MusicGame.App.updateButtons();
            Bridge.global.setInterval(MusicGame.App.showCoinsInterval, 1000);
            for (var n = 0; n < 7; n++) {
                MusicGame.App.audio[n] = new Audio("Sounds/" + MusicGame.App.noteNamesLetter[n] + ".mp3");
            }
            MusicGame.App.staveImg.src = "stave.png";
            MusicGame.App.noteImg.src = "note.png";
            MusicGame.App.lineImg.src = "line.png";
            MusicGame.App.noteName = "do";
            MusicGame.App.numRight--;
            MusicGame.App.chooseNote("do", 0, false, false);
        },
        mod: function (a, b) {
            return ((a % b) + b) % b;
        },
        httpGet: function (theUrl) {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET", theUrl, false); // false for synchronous request
            xmlHttp.send(null);
            return xmlHttp.responseText;
        },
        addCoinsFunction: function (amount) {
            var totalAmount = amount + MusicGame.App.coinsAmount;
            MusicGame.App.httpGet("coinChange.php?amount=" + totalAmount + "&user=" + MusicGame.App.gameData.account + "&password=" + MusicGame.App.gameData.password);
            document.getElementById("coinNumber").innerHTML = totalAmount.toString();
            MusicGame.App.coinsChanged(totalAmount.toString());

        },
        showCoinsInterval: function () {
            var username = document.getElementById("username").value;
            var password = document.getElementById("password").value;
            MusicGame.App.gameData = new MusicGame.GameData(username, password);
            if (MusicGame.App.coinsFlag) {
                MusicGame.App.showCoins();
                MusicGame.App.coinsFlag = false;
            }
        },
        coinsChanged: function (to) {
            MusicGame.App.coinsAmount = Bridge.Int.parseInt(to, -2147483648, 2147483647);
        },
        showCoins: function () {
            var url = "coinRead.php?user=" + document.getElementById("username").value + "&password=" + document.getElementById("password").value;
            var to = MusicGame.App.httpGet(url);
            if (to !== "no READ" && to !== "no PASSWORD") {
                document.getElementById("coinNumber").innerHTML = to;
                MusicGame.App.coinsChanged(to);
            }
        },
        getNoteName: function (note) {
            switch (MusicGame.App.clef) {
                case "treble": 
                    {
                        return MusicGame.App.getnoteNames()[MusicGame.App.mod(note - 2, MusicGame.App.getnoteNames().length)];
                    }
                case "bass": 
                    {
                        return MusicGame.App.getnoteNames()[MusicGame.App.mod(note, MusicGame.App.getnoteNames().length)];
                    }
                case "tenor": 
                    {
                        return MusicGame.App.getnoteNames()[MusicGame.App.mod(note - 3, MusicGame.App.getnoteNames().length)];
                    }
                default: 
                    throw new Bridge.ArgumentException("Invalid Clef");
            }
        },
        chooseNote: function (text, timeout, playMusicNote, addCoins) {
            if (timeout === void 0) { timeout = 2000; }
            if (playMusicNote === void 0) { playMusicNote = true; }
            if (addCoins === void 0) { addCoins = true; }
            if (MusicGame.App.blocking)
                return;
            MusicGame.App.blocking = true;

            var correct = text === MusicGame.App.noteName;
            var challenge = document.getElementById("challenge");
            if (correct) {
                challenge.innerHTML = "Correct!";
                ++MusicGame.App.numRight;
            }
            else  {
                challenge.innerHTML = "Wrong! It's " + MusicGame.App.noteName;
                ++MusicGame.App.numWrong;
            }
            if (playMusicNote)
                MusicGame.App.audio[MusicGame.App.mod(MusicGame.App.note, MusicGame.App.getnoteNames().length)].play();
            var score = document.getElementById("score");
            score.innerHTML = "Right: " + MusicGame.App.numRight + " Wrong: " + MusicGame.App.numWrong;
            Bridge.global.setTimeout(MusicGame.App.displayRandomNote, timeout);
            if (addCoins && correct)
                MusicGame.App.addCoinsFunction(1);
        },
        updateButtons: function () {
            MusicGame.App.noteName = MusicGame.App.getNoteName(MusicGame.App.note);
            for (var n = 0; n < 7; n++) 
                (function () {
                    var value = document.getElementById("b" + n);
                    var note = MusicGame.App.getnoteNames()[MusicGame.App.mod(n, MusicGame.App.getnoteNames().length)];
                    value.innerHTML = note;
                    value.onclick = function (ev) {
                        MusicGame.App.chooseNote(note);
                    };
                }).call(this);
        },
        drawNote: function () {
            var canvas = document.getElementById("canvas");
            if (canvas === undefined)
                return;
            var ctx = canvas.getContext("2d");

            ctx.fillStyle = "rgb(255,255,255)";
            ctx.fillRect(0, 0, 164, 164);
            ctx.drawImage(MusicGame.App.staveImg, 50, 50);

            var noteY = 20 - MusicGame.App.note * 5;
            ctx.drawImage(MusicGame.App.noteImg, 50, noteY);

            // lines above stave
            for (var lineY = 20; lineY >= noteY; lineY -= 10) {
                ctx.drawImage(MusicGame.App.lineImg, 50, lineY);
            }

            // lines below stave
            for (var lineY1 = 80; lineY1 <= noteY; lineY1 += 10) {
                ctx.drawImage(MusicGame.App.lineImg, 50, lineY1);
            }
        },
        updateClef: function () {
            MusicGame.App.clef = (Bridge.as((document.getElementsByName("clef")[0]), HTMLSelectElement)).value;
            MusicGame.App.displayRandomNote();
        },
        displayRandomNote: function () {
            MusicGame.App.blocking = false;

            var challenge = document.getElementById("challenge");
            challenge.innerHTML = "What is this note?";

            var oldNote = MusicGame.App.note;

            while (oldNote === MusicGame.App.note)
                MusicGame.App.note = Bridge.Int.trunc((Math.random() * (11) + MusicGame.App.minNote));
            MusicGame.App.noteName = MusicGame.App.getNoteName(MusicGame.App.note);
            MusicGame.App.drawNote();
        }
    }
});

Bridge.define('MusicGame.GameData', {
    account: null,
    password: null,
    constructor: function (account, password) {
        this.account = account;
        this.password = password;
    }
});