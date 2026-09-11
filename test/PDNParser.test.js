'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const PDNParser = require('../src/PDNParser');

describe('PDNParser', () => {
    it('parses tag pairs, moves and game termination for a single game', () => {
        const pdn = [
            '[Event "Test Event"]',
            '[Site "Test Site"]',
            '[White "Alice"]',
            '[Black "Bob"]',
            '[Result "1-0"]',
            '',
            '1. 32-28 17-22 2. 28x17 11x22 1-0'
        ].join('\n');

        const parser = new PDNParser(pdn);
        assert.equal(parser.getGameCount(), 1);

        const game = parser.parse(1);
        assert.equal(game.getTagPair('Event'), 'Test Event');
        assert.equal(game.getTagPair('White'), 'Alice');
        assert.equal(game.getTagPair('Black'), 'Bob');
        assert.equal(game.getGameTermination(), '1-0');

        const moves = game.getMoves();
        assert.equal(moves.length, 2);
        assert.equal(moves[0]['moveNumber'], '1');
        assert.equal(moves[0]['move1'], '32-28');
        assert.equal(moves[0]['move2'], '17-22');
        assert.equal(moves[1]['moveNumber'], '2');
        assert.equal(moves[1]['move1'], '28x17');
        assert.equal(moves[1]['move2'], '11x22');
    });

    it('splits several games and keeps titles/termination distinct', () => {
        const pdn = [
            '[Event "Game One"]',
            '[White "Alice"]',
            '[Black "Bob"]',
            '',
            '1. 9-13 1-0',
            '',
            '[Event "Game Two"]',
            '[White "Carol"]',
            '[Black "Dave"]',
            '',
            '1. 9-14 0-1'
        ].join('\n');

        const parser = new PDNParser(pdn);
        assert.equal(parser.getGameCount(), 2);

        const game1 = parser.parse(1);
        assert.equal(game1.getTagPair('White'), 'Alice');
        assert.equal(game1.getGameTermination(), '1-0');

        const game2 = parser.parse(2);
        assert.equal(game2.getTagPair('White'), 'Carol');
        assert.equal(game2.getGameTermination(), '0-1');

        assert.equal(
            parser.getTitle(1, 'tagWhite - tagBlack'),
            'Alice - Bob'
        );
    });

    it('parses the FEN tag into piece lists and turn color', () => {
        const pdn = [
            '[Event "FEN Test"]',
            '[FEN "W:W1,2,K3:B29,30,K31"]',
            '',
            '1. 9-13 *'
        ].join('\n');

        const parser = new PDNParser(pdn);
        const game = parser.parse(1);

        assert.equal(game.hasFEN(), true);
        assert.equal(game.getFENTurnColor(), 'W');
        assert.deepEqual(game.getFENList('WP'), [1, 2]);
        assert.deepEqual(game.getFENList('WK'), [3]);
        assert.deepEqual(game.getFENList('BP'), [29, 30]);
        assert.deepEqual(game.getFENList('BK'), [31]);
    });

    it('returns an empty result when there is no PDN text', () => {
        const parser = new PDNParser();
        assert.equal(parser.getGameCount(), 0);

        const game = parser.parse(1);
        assert.equal(game.getTagPair('Event'), '??');
        assert.deepEqual(game.getMoves(), []);
        assert.equal(game.hasFEN(), false);
    });
});
