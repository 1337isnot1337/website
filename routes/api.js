const express = require('express');
const router = express.Router();

const database = require('../server/database');
const { CATEGORIES, SUBCATEGORIES_FLATTENED } = require('../server/quizbowl.js');

// DO NOT DECODE THE ROOM NAMES - THEY ARE SAVED AS ENCODED

router.get('/num-packets', async (req, res) => {
    req.query.setName = decodeURIComponent(req.query.setName);
    const numPackets = await database.getNumPackets(req.query.setName);
    res.send(numPackets.toString());
});

router.get('/packet', async (req, res) => {
    req.query.setName = decodeURIComponent(req.query.setName);
    req.query.packetNumber = parseInt(decodeURIComponent(req.query.packetNumber));
    const packet = await database.getPacket(req.query.setName, req.query.packetNumber);
    res.send(JSON.stringify(packet));
});

router.get('/packet-bonuses', async (req, res) => {
    req.query.setName = decodeURIComponent(req.query.setName);
    req.query.packetNumber = parseInt(decodeURIComponent(req.query.packetNumber));
    const packet = await database.getPacket(req.query.setName, req.query.packetNumber, ['bonuses']);
    res.send(JSON.stringify(packet));
});

router.get('/packet-tossups', async (req, res) => {
    req.query.setName = decodeURIComponent(req.query.setName);
    req.query.packetNumber = parseInt(decodeURIComponent(req.query.packetNumber));
    const packet = await database.getPacket(req.query.setName, req.query.packetNumber, ['tossups']);
    res.send(JSON.stringify(packet));
});

router.get('/random-name', (req, res) => {
    res.send(database.getRandomName());
});


router.get('/random-question', async (req, res) => {
    if (req.body.type !== 'tossup' && req.body.type !== 'bonus') {
        res.status(400).send('Invalid question type specified.');
        return;
    }

    if (req.body.difficulties === undefined) {
        req.body.difficulties = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    }

    if (typeof req.body.difficulties === 'string') {
        req.body.difficulties = parseInt(req.body.difficulties);
    }

    if (typeof req.body.difficulties === 'number') {
        req.body.difficulties = [req.body.difficulties];
    }

    if (req.body.categories === undefined) {
        req.body.categories = CATEGORIES;
    }

    if (typeof req.body.categories === 'string') {
        req.body.categories = [req.body.categories];
    }

    if (req.body.subcategories === undefined) {
        req.body.subcategories = SUBCATEGORIES_FLATTENED;
    }

    if (typeof req.body.subcategories === 'string') {
        req.body.subcategories = [req.body.subcategories];
    }

    const question = await database.getRandomQuestion(req.body.type, req.body.difficulties, req.body.categories, req.body.subcategories);
    if (Object.keys(question).length > 0) {
        res.send(JSON.stringify(question));
    } else {
        res.sendStatus(404);
    }
});


router.post('/report-question', async (req, res) => {
    const _id = req.body._id;
    const reason = req.body.reason ?? '';
    const description = req.body.description ?? '';
    const successful = await database.reportQuestion(_id, reason, description);
    if (successful) {
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
})

router.get('/set-list', (req, res) => {
    const setList = database.getSetList(req.query.setName);
    res.send(setList);
})

module.exports = router;