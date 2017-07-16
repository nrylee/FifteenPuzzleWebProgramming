function FifteenPuzzleGame(gameWidth) {
    this.Width = parseInt(gameWidth);
    this.Tiles = [];
    this.Enabled = true;
    this.Timer = new GameClock(this);
    for (var i = 0; i < (this.Width*this.Width); i++) {
        this.Tiles.push(new GameTile(i));      
    }
    this.ZeroTileIndex = 0;
}

FifteenPuzzleGame.prototype.randomizeTiles = function() {
    this.shuffle();
    var inversions = this.calculateInversions();
    this.ZeroTileIndex = inversions.zero;
    var zeroRowFromBottom = this.Width - Math.floor(inversions.zero/this.Width);

    if(
        (this.Width%2==1 && inversions.count%2==1)              //Odd number of columns, must have even inversions
        || 
        (this.Width%2==0 &&                                     //Even number of columns:
            (zeroRowFromBottom%2==0 && inversions.count%2==0)   //Zero even from bottom, must have odd inversions
            ||
            (zeroRowFromBottom%2==1 && inversions.count%2==1)   //Zero odd from bottom, must have even inversions
        )
    ) {
        // Change inversions by 1, skipping over 0
        if(inversions.zero==0) {
            var temp = this.Tiles[1];
            this.Tiles[1] = this.Tiles[2];
            this.Tiles[2] = temp;
        } else if (inversions.zero==1) {
            var temp = this.Tiles[0];
            this.Tiles[0] = this.Tiles[2];
            this.Tiles[2] = temp;
        } else {
            var temp = this.Tiles[0];
            this.Tiles[0] = this.Tiles[1];
            this.Tiles[1] = temp;
        }
    }
}
FifteenPuzzleGame.prototype.shuffle = function() {
    var i = 0;
    var j = 0;
    var temp = null;
    for (var i = this.Tiles.length-1; i > 0; i-=1) {
        j = Math.floor(Math.random() * (i+1));
        temp = this.Tiles[i];
        this.Tiles[i] = this.Tiles[j];
        this.Tiles[j] = temp;
    }
} 
FifteenPuzzleGame.prototype.calculateInversions = function() {
    var inversionCount = 0;
    var zeroPosition;
    for (var i = 0; i < this.Tiles.length; i++) {
        if(this.Tiles[i].Number==0) {
            zeroPosition=i;
            continue;
        }
        for (var j = i+1; j < this.Tiles.length; j++) {
            if(this.Tiles[j].Number==0) continue;
            if(this.Tiles[i].Number > this.Tiles[j].Number) {
                inversionCount++;
            }
        }
    }
    return { count: inversionCount, zero: zeroPosition };
}
FifteenPuzzleGame.prototype.buildBoard = function(pixelWidth) {
    var board = document.getElementById('gameBoard');
    board.className = 'board-width-'+this.Width;
    board.style.width = board.style.height = (pixelWidth+8) + 'px';
    var tileSize = parseInt(pixelWidth)/this.Width;
    for (var i = 0; i < this.Tiles.length; i++) {
        this.Tiles[i].generateDiv(tileSize, i%(this.Width), Math.floor(i/this.Width));
        board.appendChild(this.Tiles[i].Tile);
    }
}
FifteenPuzzleGame.prototype.evaluateWin = function() {
    var inv = this.calculateInversions();
    if(inv.count==0 && inv.zero==this.Tiles.length-1) {
        //Winner, winner, chicken dinner
        this.Timer.stop();
        for (var i = 0; i < this.Tiles.length; i++) {
            this.Tiles[i].Tile.style.margin = '0px';
            this.Tiles[i].Tile.style.borderWidth = '0px';
            this.Tiles[i].Tile.style.width = 
                this.Tiles[i].Tile.style.height =
                    this.Tiles[i].Tile.style.lineHeight =
                        this.Tiles[i].Size + 'px';
            this.Tiles[i].Tile.style.borderRadius = '0px';
        }
        this.Enabled = false; 
        var msgBox = document.getElementById('playerMessage');
        if(msgBox) {
            msgBox.innerHTML = "You Won! It took you " + this.Timer.totalTimeString() + " from your first move";
        }
    }
    else {

    }
}
FifteenPuzzleGame.prototype.moveUp = function() {
    if(this.Enabled && this.ZeroTileIndex >= this.Width) {
        var ZeroTile = this.Tiles[this.ZeroTileIndex];
        this.Tiles[this.ZeroTileIndex-this.Width].moveDown();
        ZeroTile.moveUp();
        this.Tiles[this.ZeroTileIndex] = this.Tiles[this.ZeroTileIndex-this.Width];
        this.Tiles[this.ZeroTileIndex-this.Width] = ZeroTile;
        this.ZeroTileIndex = this.ZeroTileIndex-this.Width;
        
        if( ! this.Timer.Running) this.Timer.start();
        this.evaluateWin();
    } else {
        // Can't move up, because at top of board.
    }
}
FifteenPuzzleGame.prototype.moveDown = function() {
    if(this.Enabled && this.ZeroTileIndex < this.Tiles.length-this.Width) {
        var ZeroTile = this.Tiles[this.ZeroTileIndex];
        this.Tiles[this.ZeroTileIndex+this.Width].moveUp();
        ZeroTile.moveDown();
        this.Tiles[this.ZeroTileIndex] = this.Tiles[this.ZeroTileIndex+this.Width];
        this.Tiles[this.ZeroTileIndex+this.Width] = ZeroTile;
        this.ZeroTileIndex = this.ZeroTileIndex+this.Width;

        if( ! this.Timer.Running) this.Timer.start();
        this.evaluateWin();
    } else {
        // Can't move up, because at top of board.
    }
}
FifteenPuzzleGame.prototype.moveLeft = function() {
    if(this.Enabled && this.ZeroTileIndex%this.Width > 0) {
        var ZeroTile = this.Tiles[this.ZeroTileIndex];
        this.Tiles[this.ZeroTileIndex-1].moveRight();
        ZeroTile.moveLeft();
        this.Tiles[this.ZeroTileIndex] = this.Tiles[this.ZeroTileIndex-1];
        this.Tiles[this.ZeroTileIndex-1] = ZeroTile;
        this.ZeroTileIndex = this.ZeroTileIndex-1;

        if( ! this.Timer.Running) this.Timer.start();
        this.evaluateWin();
    } else {
        // Can't move up, because at top of board.
    }
}
FifteenPuzzleGame.prototype.moveRight = function() {
    if(this.Enabled && this.ZeroTileIndex%this.Width < this.Width-1) {
        var ZeroTile = this.Tiles[this.ZeroTileIndex];
        this.Tiles[this.ZeroTileIndex+1].moveLeft();
        ZeroTile.moveRight();
        this.Tiles[this.ZeroTileIndex] = this.Tiles[this.ZeroTileIndex+1];
        this.Tiles[this.ZeroTileIndex+1] = ZeroTile;
        this.ZeroTileIndex = this.ZeroTileIndex+1;

        if( ! this.Timer.Running) this.Timer.start();
        this.evaluateWin();
    } else {
        // Can't move up, because at top of board.
    }
}

function GameTile(num) {
    this.Number = parseInt(num);
    this.Tile = null;
    this.Size = 0;
    this.Left = 0;
    this.Top = 0;
}

GameTile.prototype.generateDiv = function(size, left, top) {
    this.Top = parseInt(top);
    this.Left = parseInt(left);
    this.Size = parseInt(size);
    var div = document.createElement('div');
	var num = this.Number;
    this.Tile = div;    
    div.classList.add('game-tile');
    div.setAttribute('data-num', this.Number);
    this.updatePosition();
    div.style.width = div.style.height = div.style.lineHeight = (this.Size-4) + 'px';
    div.style.margin = '2px';
    if(this.Number==0) {
        div.id = 'blankTile';
        div.innerHTML = '&nbsp;'
    } else {
        div.innerHTML = this.Number;
        div.id = "tile"+this.Number;
    }
	div.onclick = function() {
		clickMove(num);
	};
}
GameTile.prototype.updatePosition = function() {
    this.Tile.style.left = (this.Size*this.Left) + 'px';
    this.Tile.style.top = (this.Size*this.Top) + 'px';
}
GameTile.prototype.moveUp = function() {
    this.Top = this.Top-1;
    this.updatePosition();
}
GameTile.prototype.moveDown = function() {
    this.Top = this.Top+1;
    this.updatePosition();
}
GameTile.prototype.moveLeft = function() {
    this.Left = this.Left-1;
    this.updatePosition();
}
GameTile.prototype.moveRight = function() {
    this.Left = this.Left+1;
    this.updatePosition();
}

function GameClock(game) {
    this.StartTime;
    this.EndTime;
    this.Game = game;
    this.Running = false;
    this.Clock = document.getElementById('gameClock');
}
GameClock.prototype.start = function() {
    this.StartTime = Date.now();
    this.Running = true;
    var game = this.Game;
    function clockStep() {
        if(game && game.Timer) {
            var clock = game.Timer;
            var end;
            if(clock.Running) {
                end = Date.now();
            }
            else {
                end = clock.EndTime;
            }
            var time = new Date(end - clock.StartTime);
            var h = padTime(time.getUTCHours());
            var m = padTime(time.getUTCMinutes());
            var s = padTime(time.getUTCSeconds());
            clock.Clock.innerHTML = 
                h + ":" + m + ":" + s;
            if(clock.Running) setTimeout(clockStep, 250);
        }
    }
    clockStep();
}
GameClock.prototype.stop = function() {
    this.EndTime = Date.now();
    this.Running = false;
}

function padTime(t) {
    if (t < 10) {t = "0" + t};
    return t;
}

GameClock.prototype.totalTimeString = function() {
    var time = new Date(this.EndTime - this.StartTime);
    var str = '';
    if (time.getUTCHours() > 0) {
        str += time.getUTCHours() + 'H ';
    }
    if (time.getUTCMinutes() > 0) {
        str += time.getUTCMinutes() + 'M ';
    }
    str += time.getUTCSeconds() + 'S';
    return str;
}

function clickMove(tileIndex) {
	if(g.ZeroTileIndex+1 == tileIndex) {
		g.moveRight();
	}
	if(g.ZeroTileIndex+g.Width == tileIndex) {
		g.moveDown();
	}
	if(g.ZeroTileIndex-g.Width == tileIndex) {
		g.moveUp();
	}
	if(g.ZeroTileIndex-1 == tileIndex) {
		g.moveLeft();
	}
	
}

var g;
window.addEventListener('load', function() {
    var width = 4;
    g = new FifteenPuzzleGame(width);
    g.buildBoard(width*100);

    document.getElementById('btnShuffle').addEventListener('click', function() {
        g.Timer.stop();
        var board = document.getElementById('gameBoard').innerHTML = "";
        g.randomizeTiles();
        g.buildBoard(width*100);
    });
    document.getElementById('btnUp').addEventListener('click', function() {
        g.moveUp();
    });
    document.getElementById('btnDown').addEventListener('click', function() {
        g.moveDown();
    });
    document.getElementById('btnLeft').addEventListener('click', function() {
        g.moveLeft();
    });
    document.getElementById('btnRight').addEventListener('click', function() {
        g.moveRight();
    });
    document.addEventListener('keypress', function(e) {
        switch (e.keyCode) {
            case 87:
            case 119:
                g.moveUp();
                break;
            case 65:
            case 97:
                g.moveLeft();
                break;
            case 83:
            case 115:
                g.moveDown();
                break;
            case 68:
            case 100:
                g.moveRight();
                break;
            default:
                break;
        }
    });

    document.getElementById('selectChangeSize').addEventListener('change', function() {
        width = parseInt(this.value);
        g.Timer.stop();
        var board = document.getElementById('gameBoard').innerHTML = "";
        g = new FifteenPuzzleGame(width);
        g.buildBoard(width*100);
    });
});