function PDNObject() {
    this.tags = {};
    this.listMoveText = []; // [{}]
    this.gameTermination = "";
    this.fenWhitePawn = []; // [int]
    this.fenBlackPawn = []; // [int]
    this.fenWhiteKing = []; // [int]
    this.fenBlackKing = []; // [int]
    this.fenTurnColor = ""; // "W" | "B"
}

PDNObject.prototype.getTagPair = function(tagName) {
    var value = "??";

    if (this.tags != null && (tagName in this.tags)) {
        value = this.tags[tagName];
    }

    if (value.trim() == "") {
        value = "??";
    }

    return value;
};

PDNObject.prototype.getFENTurnColor = function() {
    if (this.fenTurnColor == null) {
        return "";
    }
    return this.fenTurnColor;
};

PDNObject.prototype.getFENList = function(which) {
    var list = null;

    if (which == "WP") {
        list = this.fenWhitePawn;
    } else if (which == "BP") {
        list = this.fenBlackPawn;
    } else if (which == "WK") {
        list = this.fenWhiteKing;
    } else if (which == "BK") {
        list = this.fenBlackKing;
    }

    if (list == null) {
        list = [];
    }
    return list;
};

PDNObject.prototype.isTagValueEmpty = function(value) {
    return (value == null || value == "??");
};

PDNObject.prototype.hasFEN = function() {
    return !isTagValueEmpty(this.getTagPair("FEN"));
};

PDNObject.prototype.getMoves = function() {
    return this.listMoveText;
};

PDNObject.prototype.getGameTermination = function() {
    return this.gameTermination;
};

PDNObject.prototype.setFenWP = function(wpList) {
    this.fenWhitePawn = wpList;
};

PDNObject.prototype.setFenBP = function(bpList) {
    this.fenBlackPawn = bpList;
};

PDNObject.prototype.setFenWK = function(wkList) {
    this.fenWhiteKing = wkList;
};

PDNObject.prototype.setFenBK = function(bkList) {
    this.fenBlackKing = bkList;
};

PDNObject.prototype.setFenTurnColor = function(fenTurnColor) {
    this.fenTurnColor = fenTurnColor;
};

PDNObject.prototype.setGameTermination = function(gameTermination) {
    if (gameTermination != null) {
        this.gameTermination = gameTermination;
    }
};

PDNObject.prototype.setTagPairs = function(tags) {
    if (tags != null) {
        this.tags = tags;
    }
};

PDNObject.prototype.setMoveText = function(list) {
    if (list != null) {
        this.listMoveText = list;
    }
};

PDNObject.prototype.debugTags = function() {
    console.log("");
    console.log("----------------------------------------");
    console.log(" Tag Pairs :");
    console.log("----------------------------------------");
    if (this.tags == null) {
        console.log("Erreur...");
        return;
    }

    var tagNames = Object.keys(this.tags);
    for (var k = 0; k < tagNames.length; k++) {
        console.log(tagNames[k] + " = " + this.tags[tagNames[k]]);
    }
};

PDNObject.prototype.debugOfficialTags = function() {
    console.log("");
    console.log("-----------------------------------------------------");
    console.log("Event : " + this.getTagPair("Event"));
    console.log("Site : " + this.getTagPair("Site"));
    console.log("Date : " + this.getTagPair("Date"));
    console.log("GameType : " + this.getTagPair("GameType"));
    console.log("Round : " + this.getTagPair("Round"));
    console.log("White : " + this.getTagPair("White"));
    console.log("Black : " + this.getTagPair("Black"));
    console.log("Result : " + this.getTagPair("Result"));
    console.log("SetUp : " + this.getTagPair("SetUp"));
    console.log("FEN : " + this.getTagPair("FEN"));

    console.log("FEN TURN = " + this.getFENTurnColor());
    console.log("FEN WP = " + this.getFENList("WP"));
    console.log("FEN BP = " + this.getFENList("BP"));
    console.log("FEN WK = " + this.getFENList("WK"));
    console.log("FEN BK = " + this.getFENList("BK"));
};

PDNObject.prototype.debugMoveText = function() {
    console.log("");
    console.log("----------------------------------------");
    console.log(" Move Text :");
    console.log("----------------------------------------");
    if (!this.listMoveText) {
        console.log("Erreur...");
        return;
    }

    // Moves
    for (var m = 0; m < this.listMoveText.length; m++){
        var mapMove = this.listMoveText[m];
        var keys = Object.keys(mapMove);
        for (var k = 0; k < keys.length; k++) {
            console.log(keys[k] + " = " + mapMove[keys[k]]);
        }
        console.log("----------");
    }
};

