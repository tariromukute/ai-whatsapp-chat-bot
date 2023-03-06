
// const { assert, expect } = require('chai');
const { assert, expect } = require('chai');
const { BingChatService } = require('../../services/bing-chat.js');

describe('Bing Chat', function() {
    it('should return a response', async function() {
        this.timeout(50000);
        const api = new BingChatService({
            cookie: process.env.BING_COOKIE
        });

        const res = await api.sendMessage('Hello World!');
        expect(res).to.be.a('object');
        expect(res).to.have.property('text');
        expect(res).to.have.property('detail');
    });

    it('should have a conversation', async function() {
        this.timeout(100000);
        const api = new BingChatService({
            cookie: process.env.BING_COOKIE
        });

        const res = await api.sendMessage('Write a poem about birds');
        expect(res).to.be.a('object');
        expect(res).to.have.property('text');

        const res2 = await api.sendMessage('Can you make the poem shorter?', { 
            conversationId: res.conversationId, 
            clientId: res.clientId,
            conversationSignature: res.conversationSignature
        });
        expect(res2).to.be.a('object');
        expect(res2).to.have.property('text');

    });
});
