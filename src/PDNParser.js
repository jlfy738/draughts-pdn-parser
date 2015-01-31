function PDNParser(pdnText) {
    // Tag Pair
    this._patternTagPair = /^\[\s*(\w*)\s*\"(.*?)\"\s*\]$/;

    // MoveText
    this._patternMoveText = /(?:(\d+)\.(?:\.\.|\s+\.\.\.)?)?\s+(\d+(?:[-x]\d+)+)([\!\?\*\(\)]*)\s+(?:\{([^}]*)\}){0,1}\s*(?:(\d+(?:[-x]\d+)+)([\!\?\*\(\)]*)\s+?(?:\{([^}]*)\}){0,1})?/g;

    // Game-termination :
    // " 1-0 " ; " 0-1 " ; " 1/2-1/2 " ; " * "
    // " 2-0 " ; " 0-2 " ; " 1-1 "
    // Note : no confusion with move notation because of zero square do not exist and move on contigus squares is not valid
    // idem with asterisk and move 'glyph' because of leading and trailing space.
    this._patternGameTermination = /\s([012]\-[012]|1\/2\-1\/2|\*)\s/g;

    // FEN Tag value
    this._patternFEN = /^(W|B):(W|B)((?:K?\d*)(?:,K?\d+)*?)(?::(W|B)((?:K?\d*)(?:,K?\d+)*?))?$/;

    this.pdnSourceText = null;
    this.indexes = null;

    this.setPDNText(pdnText);
}


PDNParser.prototype.setPDNText = function(pdnText) {
    this.pdnSourceText = pdnText ? pdnText : null;
    
    if (this.pdnSourceText !== null){
        this._init();
    }
};

PDNParser.prototype._init = function() {
    this.pdnSourceText = this.pdnSourceText.trim() + " "; // for regexp...
    this.indexes = this._cutPDN();
};

PDNParser.prototype._readyToParse = function(numGame) {
    var b = true;

    if (this.pdnSourceText === null) {
        b = false;
    } else if (numGame <= 0 || numGame > this.indexes.length) {
        b = false;
    }

    return b;
};

PDNParser.prototype._cutPDN = function() {
    var liste = []; // [{string:string}]

    var idxNextGame = 0;
    var match;
    var cpt = 0;
    while ((match = this._patternGameTermination.exec(this.pdnSourceText)) !== null) {
        cpt++; if (cpt>200) break; // security
        
        var idxStart = match.index;
        var idxEnd = idxStart + match[0].length;

        var map = {};
        map["idxStartGame"] = "" + idxNextGame;
        map["idxStartGameTermination"] = "" + idxStart;
        map["idxEndGame"] = "" + idxEnd;
        liste.push(map);

        idxNextGame = idxEnd;

        //console.log(match);
        //console.log("(" + idxStart + ", " +  idxEnd + ") = '" + this.pdnSourceText.substring(idxStart, idxEnd) + "'");
    }

    return liste;
};

PDNParser.prototype.debugCutGames = function() {
    console.log("");
    console.log("----------------------------------------");
    console.log(" Cut Games :");
    console.log("----------------------------------------");
    if (this.indexes === null || this.indexes.length == 0) {
        console.log("Erreur...");
        return;
    }

    console.log("Nombre de parties : " + this.indexes.length);
    console.log("----------");

    for (var h = 0; h < this.indexes.length; h++) {
        var map = this.indexes[h];
        var keys = Object.keys(map);
        for (var k = 0; k < keys.length; k++) {
            var key = keys[k];
            console.log(key + " = " + map[key]);
        }
        console.log("----------");
    }


    for (var h = 0; h < this.indexes.length; h++) {
        var map = this.indexes[h];
        
        var idxStartGame = parseInt(map["idxStartGame"]);
        var idxEndGame = parseInt(map["idxEndGame"]);
        console.log(this.pdnSourceText.substring(idxStartGame, idxEndGame));
        console.log("----------");
    }

};

