class BingChatService {
  constructor({ cookie }) {
    this.cookie = cookie
  }

  async sendMessage(text, opts = {}) {
      if (!this.api) {
        let BingChat = await import("bing-chat");
        this.api = new BingChat.BingChat({ cookie: this.cookie })
      }
      const res = await this.api.sendMessage(text, opts)
      return res;
  }
}

module.exports = {
  BingChatService
}