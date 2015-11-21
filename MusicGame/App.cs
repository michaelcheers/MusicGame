using Bridge;
using Bridge.Html5;
using System;

namespace MusicGame
{
    public class GameData
    {
        public GameData (string account, string password)
        {
            this.account = account;
            this.password = password;
        }
        public string account;
        public string password;
    }
    public class App
    {
        [Ready]
        public static void Main()
        {
            Global.SetInterval(ShowCoinsInterval, 1000);
            for (int n = 0; n < 7; n++)
            {
                audio[n] = new AudioElement("Sounds/" + noteNamesLetter[n] + ".mp3");
            }
            staveImg.Src = "stave.png";
            noteImg.Src = "note.png";
            lineImg.Src = "line.png";
            noteName = "do";
            numRight--;
            ChooseNote("do", 0, false, false);
        }

        static int note = 0;
        const int maxNote = 3;
        const int minNote = -8;
        static string[] noteNamesDor = new[] { "Do", "Re", "Mi", "Fa", "So", "La", "Ti" };
        static string[] noteNamesLetter = new[] { "C", "D", "E", "F", "G", "A", "B" };
        static AudioElement[] audio = new AudioElement[7];
        static string noteName;
        static ImageElement staveImg = new ImageElement();
        static ImageElement noteImg = new ImageElement();
        static ImageElement lineImg = new ImageElement();
        static bool blocking = false;
        static int numRight = 0;
        static int numWrong = 0;
        static GameData gameData;
        private static bool coinsFlag;
        private static int coinsAmount;

        static int mod(int a, int b)
        {
            return ((a % b) + b) % b;
        }

        static string HttpGet (string theUrl)
        {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.Open("GET", theUrl, false); // false for synchronous request
            xmlHttp.ToDynamic().send(null);
            return xmlHttp.ResponseText;
        }

        static void AddCoinsFunction(int amount)
        {
            var totalAmount = amount + coinsAmount;
            HttpGet("coinChange.php?amount=" + totalAmount + "&user=" + gameData.account + "&password=" + gameData.password);
            Document.GetElementById("coinNumber").InnerHTML = totalAmount.ToString();
            CoinsChanged(totalAmount.ToString());

        }

        static void ShowCoinsInterval()
        {
            var username = Document.GetElementById<InputElement>("username").Value;
            var password = Document.GetElementById<InputElement>("password").Value;
            gameData = new GameData(username, password);
            if (coinsFlag)
            {
                ShowCoins();
                coinsFlag = false;
            }
        }

        static void CoinsChanged(string to)
        {
            coinsAmount = int.Parse(to);
        }

        static void ShowCoins()
        {
            var url = "coinRead.php?user=" + Document.GetElementById<InputElement>("username").Value + "&password=" + Document.GetElementById<InputElement>("password").Value;
            var to = HttpGet(url);
            if (to != "no READ" && to != "no PASSWORD")
            {
                Document.GetElementById("coinNumber").InnerHTML = to;
                CoinsChanged(to);
            }
        }

        static string GetNoteName (int note)
        {
            switch (clef)
            {
                case "treble":
                    {
                        return noteNames[mod(note + 2, noteNames.Length)];
                    }
                case "bass":
                    {
                        return noteNames[mod(note, noteNames.Length)];
                    }
                default:
                    throw new ArgumentException("Invalid Clef");
            }
        }

        static void ChooseNote(string text, int timeout = 2000, bool playMusicNote = true, bool addCoins = true)
        {
            if (blocking)
                return;
            blocking = true;

            bool correct = text == noteName;
            var challenge = Document.GetElementById("challenge");
            if (correct)
            {
                challenge.InnerHTML = "Correct!";
                ++numRight;
            }
            else
            {
                challenge.InnerHTML = "Wrong! It's " + noteName;
                ++numWrong;
            }
            if (playMusicNote)
                audio[mod(note, noteNames.Length)].Play();
            var score = Document.GetElementById("score");
            score.InnerHTML = "Right: " + numRight + " Wrong: " + numWrong;
            Global.SetTimeout(DisplayRandomNote, timeout);
            if (addCoins && correct)
                AddCoinsFunction(1);
        }

        static string[] noteNames
        {
            get
            {
                switch (((SelectElement)Document.GetElementsByName("buttonType")[0]).Value)
                {
                    case "letter":
                            return noteNamesLetter;
                    case "dor":
                        return noteNamesDor;
                }
                throw new ArgumentException("Problem");
            }
        }

        static void UpdateButtons ()
        {
            noteName = GetNoteName(note);
            for (int n = 0; n < 7; n++)
            {
                var value = Document.GetElementById("b" + n);
                var note = noteNames[n];
                value.InnerHTML = note;
                value.OnClick = (ev) => { ChooseNote(note); };
            }
        }

        static void DrawNote ()
        {
            CanvasElement canvas = Document.GetElementById<CanvasElement>("canvas");
            if (canvas == Global.Undefined)
                return;
            var ctx = canvas.GetContext("2d").ToDynamic();

            ctx.fillStyle = "rgb(255,255,255)";
            ctx.fillRect(0, 0, 164, 164);
            ctx.drawImage(staveImg, 50, 50);

            var noteY = 20 - note * 5;
            ctx.drawImage(noteImg, 50, noteY);

            // lines above stave
            for (var lineY = 20; lineY >= noteY; lineY -= 10)
            {
                ctx.drawImage(lineImg, 50, lineY);
            }

            // lines below stave
            for (var lineY = 80; lineY <= noteY; lineY += 10)
            {
                ctx.drawImage(lineImg, 50, lineY);
            }
        }

        static void UpdateClef ()
        {
            clef = (Document.GetElementsByName("clef")[0]).ToDynamic().value;
            DrawNote();
        }

        static string clef = "treble";

        static void DisplayRandomNote()
        {
            blocking = false;

            var challenge = Document.GetElementById("challenge");
            challenge.InnerHTML = "What is this note?";

            var oldNote = note;

            while (oldNote == note)
                note = (int)(Math.Random() * (maxNote - minNote) + minNote);
            noteName = noteNames[mod(note, noteNames.Length)];
            DrawNote();
        }

    }
}