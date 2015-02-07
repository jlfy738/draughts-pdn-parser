var PDNObject = require('./PDNObject');

function PDNParser(pdnText) {
    // Tag Pair
    this._patternTagPair = /^\[\s*(\w*)\s*\"(.*?)\"\s*\]$/;

    // MoveText
    this._patternMoveText = /(?:(\d+)\.(?:\.\.|\s+\.\.\.)?)?\s*(\d+(?:[-x]\d+)+)([\!\?\*\(\)]*)\s+(?:\{([^}]*)\}){0,1}\s*(?:(\d+(?:[-x]\d+)+)([\!\?\*\(\)]*)\s+?(?:\{([^}]*)\}){0,1})?/g;

    // Game-termination :
    // " 1-0 " ; " 0-1 " ; " 1/2-1/2 " ; " * "
    // " 2-0 " ; " 0-2 " ; " 1-1 "
    // Note : no confusion with move notation because of zero square do not exist and move on contigus squares is not valid
    // idem with asterisk and move 'glyph' because of leading and trailing space.
    this._patternGameTermination = /(?:^|\s)([012]\-[012]|1\/2\-1\/2|\*)(?:$|\s)/g;

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
    this._parseNameOfGames();
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

PDNParser.prototype.parse = function(numGame) {
    var pdnObj = new PDNObject();

    if (!this._readyToParse(numGame)) {
        return pdnObj;
    }

    // ------------------
    // Parse PDN
    // ------------------
    var pdn = this._parsePDN(numGame);

    var tags  = pdn["tagPairs"];
    var moves = pdn["moveText"];
    var gameTermination = pdn["gameTermination"];

    pdnObj.setTagPairs(tags);
    pdnObj.setMoveText(moves);
    pdnObj.setGameTermination(gameTermination);

    // ------------------
    // Parse FEN
    // ------------------
    var fen = pdnObj.getTagPair("FEN");
    if (fen != "??") {
        var map = this._parseTagFEN(fen);
        if (map !== null) {
            pdnObj.setFenWP(map["WP"]);
            pdnObj.setFenBP(map["BP"]);
            pdnObj.setFenWK(map["WK"]);
            pdnObj.setFenBK(map["BK"]);
            pdnObj.setFenTurnColor(map["turnColor"]);
        }
    }

    return pdnObj;
};

PDNParser.prototype.getGameCount = function() {
    var nb = 0;
    if (this.indexes != null) {
        nb = this.indexes.length;
    }
    return nb;
};

PDNParser.prototype.isTagValueEmpty = function(value) {
    return (value == null || value == "??");
};





PDNParser.prototype._parseTagFEN = function(fen) {
    if (this.isTagValueEmpty(fen)) {
        return null;
    }

    var turnColor = "";
    var whitePawnPositions = [];
    var whiteKingPositions = [];
    var blackPawnPositions = [];
    var blackKingPositions = [];

    var m = this._patternFEN.exec(fen);
    //var m = fen.match(this._patternFEN);
    if (m != null) {
    
        // var source = m[0];
        turnColor = m[1];
        var color1 = m[2];
        var color1Position = m[3];
        var color2 = m[4];
        var color2Position = m[5];

        if (color1Position != null && color1Position != "") {
            var isWhite = (color1 == "W");
            var positions = color1Position.split(",");

            var map = this._getPawnAndKingList(positions);
            if (isWhite) {
                whitePawnPositions = map["pawn"];
                whiteKingPositions = map["king"];
            } else {
                blackPawnPositions = map["pawn"];
                blackKingPositions = map["king"];
            }
        }

        if (color2Position != null && color2Position != "") {
            var isWhite = (color2 == "W");
            var positions = color2Position.split(",");

            var map = this._getPawnAndKingList(positions);
            if (isWhite) {
                whitePawnPositions = map["pawn"];
                whiteKingPositions = map["king"];
            } else {
                blackPawnPositions = map["pawn"];
                blackKingPositions = map["king"];
            }
        }
    }

    var map = {};
    map["WP"] = whitePawnPositions;
    map["WK"] = whiteKingPositions;
    map["BP"] = blackPawnPositions;
    map["BK"] = blackKingPositions;
    map["turnColor"] = turnColor;

    return map;
};

PDNParser.prototype._getPawnAndKingList = function(positions) {
    var pawnPositions = [];
    var kingPositions = [];

    if (positions != null && positions.length > 0) {
        for (var k = 0; k < positions.length; k++) {
            var pos = positions[k];
            if (pos.length > 0) {
                var sf = pos.substring(0, 1);
                var isKing = (sf == "K");

                if (isKing) {
                    pos = pos.substring(1);
                }

                var iPos = parseInt(pos);
                if (!isNaN(iPos)){
                    if (isKing) {
                        kingPositions.push(iPos);
                    } else {
                        pawnPositions.push(iPos);
                    }
                }
            }
        }
    }

    var map = {};
    map["pawn"] = pawnPositions;
    map["king"] = kingPositions;
    return map;
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

PDNParser.prototype._parseNameOfGames = function() {
    for (var k = 0; k < this.indexes.length; k++) {
        var h = this.indexes[k];
        var idxStart = h["idxStartGame"];
        var idxEnd   = h["idxEndGame"];

        var cText = this.pdnSourceText.substring(idxStart, idxEnd);
        cText = cText.trim() + " ";

        h["tagEvent"] = this._extractTagPairValueForKey(cText, "Event");
        h["tagDate"]  = this._extractTagPairValueForKey(cText, "Date");
        h["tagWhite"] = this._extractTagPairValueForKey(cText, "White");
        h["tagBlack"] = this._extractTagPairValueForKey(cText, "Black");
        h["tagRound"] = this._extractTagPairValueForKey(cText, "Round");
    }
};

PDNParser.prototype._extractTagPairValueForKey = function(gameText, tagPairKey) {
    var re = new RegExp("\\[\\s*" + tagPairKey + "\\s*\"(.*?)\"\\s*\\]", "i");
    var m = re.exec(gameText);

    var value = "";
    if (m != null) {
        value = m[1].trim();
    }

    if (value == "") {
        value = "??";
    }

    return value;
};

PDNParser.prototype.getTitle = function(numGame, pattern) {
    if (!this._readyToParse(numGame)) {
        return "";
    }

    if (pattern === undefined) {
        pattern = "tagEvent (tagDate) : tagWhite - tagBlack [tagRound]";
    }

    var h = this.indexes[numGame - 1];
    var keywords = ["tagEvent", "tagDate", "tagWhite", "tagBlack", "tagRound"];

    var title = pattern;
    for (var k = 0; k < keywords.length; k++) {
        var keyword = keywords[k];
        title = title.replace(keyword, h[keyword]);
    }
    return title;
};

PDNParser.prototype.getTitles = function(pattern) {
    var list = [];

    var nb = this.getGameCount();
    for (var k = 0; k < nb; k++) {
        var numGame = k + 1;
        var title = this.getTitle(numGame, pattern);
        list.push({'num':numGame, 'title':title});
    }
    return list;
};


PDNParser.prototype._parsePDN = function(numGame) {
    var m = this.indexes[numGame - 1];

    var idxStart = parseInt(m["idxStartGame"]);
    var idxEnd   = parseInt(m["idxEndGame"]);

    var cText = this.pdnSourceText.substring(idxStart, idxEnd);

    // TODO: comment before moveText section
    // TODO: endline comment "; this is an endline comment"

    // ------------------
    // TAG PAIRS
    // ------------------
    var mapTags = this._parseTagPairs(cText);

    // ------------------
    // MOVE TEXT
    // ------------------
    var idx = this._getNextIndex(mapTags);
    var lmMoves = this._parseMoveText(cText, idx);

    // Cleanup
    delete mapTags["nextIndexToParse"];

    // Deballage
    var gameTermination = null;
    if (lmMoves.length > 0) {
        var map = lmMoves[0];
        gameTermination = map["gameTermination"];
        // map["nextIndexToParse"];

        lmMoves = lmMoves.slice(1, lmMoves.length);
    }

    // ------------------
    var res = {};
    res["tagPairs"] = mapTags;
    res["moveText"] = lmMoves;
    res["gameTermination"] = gameTermination;

    return res;
};

PDNParser.prototype._parseTagPairs = function(texte) {
    var map = {};
    map["nextIndexToParse"] = "0";

    var rTexte = texte.trim();
    while (rTexte.substring(0, 1) == "[") {

        var i = rTexte.indexOf("]", 1);
        if (i == -1) {
            console.log("Erreur");
            return null;
        }

        var tag = rTexte.substring(0, i + 1);
        rTexte = rTexte.substring(i + 2).trim();

        // ---

        var m = this._patternTagPair.exec(tag);
        //var m = fen.match(this._patternFEN);
        if (m != null) {
            var key = m[1];
            var value = m[2];

            // Normalisation
            value = value.trim();
            if (key == "FEN") {
                value = value.replace(" ", "");
            }
            // --------------
            map[key] = value;

            var idx = texte.indexOf(tag);
            if (idx != -1) {
                idx = idx + tag.length;
                map["nextIndexToParse"] = "" + idx;
            }
        }

    }

    return map;
};

PDNParser.prototype._getNextIndex = function(map) {
    if (map == null) {
        return -1;
    }

    var idx = parseInt(map["nextIndexToParse"]);
    return idx;
};

PDNParser.prototype._parseMoveText = function(texte, idx) {
    var liste = [];

    var rTexte = texte.substring(idx);
    rTexte = rTexte + " "; // Pour la regexp

    // Game-termination
    this._patternGameTermination.lastIndex = 0; // Reset the starting position of the next call
    var m = this._patternGameTermination.exec(rTexte);
    //var m = rTexte.match(this._patternGameTermination);
    if (m == null) {
        console.log("Game termination not found !");
        return liste;
    }

    var idxStart = m.index;
    var idxEnd = idxStart + m[0].length;
    var gameTermination = rTexte.substring(idxStart, idxEnd).trim();

    // Metadata on list
    var idxNextGame = idx + idxEnd;
    // ---
    var moveText = rTexte.substring(0, idxStart);
    moveText = moveText.trim();
    moveText = moveText + " "; // for next regexp.

    var map = {};
    map["nextIndexToParse"] = "" + idxNextGame;
    map["gameTermination"] = gameTermination;
    map["text"] = moveText;
    liste.push(map);
    

    var cpt = 0;
    var match;
    while ((match = this._patternMoveText.exec(moveText)) !== null) {
        cpt++; if (cpt>200) break; // security
        
        var dic = [];
        dic["source"]     = match[0];
        dic["moveNumber"] = match[1];
        dic["move1"]      = this._normalize(match[2]);
        dic["glyph1"]     = this._normalize(match[3]);
        dic["comment1"]   = this._normalize(match[4]);
        dic["move2"]      = this._normalize(match[5]);
        dic["glyph2"]     = this._normalize(match[6]);
        dic["comment2"]   = this._normalize(match[7]);
        liste.push(dic);
    }

    return liste;
};

PDNParser.prototype._normalize = function(sValue) {
    if (sValue == null) {
        sValue = "";
    }
    return sValue.trim();
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

module.exports = PDNParser;

