// Create a BingChatDialog class
const { TextPrompt, WaterfallDialog, ChoicePrompt } = require("botbuilder-dialogs");
const { dialogs } = require("../config");
const { BingChatService } = require("../services/bing-chat.js");
const { CancelAndHelpDialog } = require("./cancelAndHelpDialog");
const { validateSuggestionChoice } = require("./utils/helpers");

const TEXT_PROMPT = 'textPrompt';
const CHOICE_PROMPT = 'choicePrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

const bingChatDialog = dialogs.BingChatDialog;
class BingChatDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || "bingChatDialog");

        this.initialDialogId = bingChatDialog.name;
        this.bingChatService = new BingChatService({ cookie: process.env.BING_COOKIE });
        
        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT, validateSuggestionChoice.bind(this)))
            .addDialog(new WaterfallDialog(bingChatDialog.name, [
                this.startQueryChat.bind(this),
                this.bingChatStep.bind(this),
                this.isDialogComplete.bind(this)
            ]));

    }

    /**
     * Get user's query
     * @param {*} stepContext
     * @returns
     */
    async startQueryChat(stepContext) {
        const query = stepContext.options;
        console.log("query: " + JSON.stringify(query));
        // if query is empty object
        if(!query || !query.text || Object.keys(query).length === 0 && query.constructor === Object) {
            const messageText = 'What can I help you with?';
            return await stepContext.prompt(TEXT_PROMPT, { prompt: messageText });
        }
        
        // Check if this is a continuation of a previous dialog and save conversion context
        if (query.opts) {
            stepContext.values.opts = query.opts;
        }
        return await stepContext.next(query.text);
    }

    /**
     * Respond to user's query using Bing
     * @param {*} stepContext
     * @returns
     */
    async bingChatStep(stepContext) {
        const query = stepContext.result;
        console.log("query: " + JSON.stringify(query));
        const opts = stepContext.values.opts || { };
        const res = await this.bingChatService.sendMessage(query, opts);
        console.log("res: " + JSON.stringify(res)); 
    
        // Send response to user
        await stepContext.context.sendActivity(res);

        if (res.detail.suggestedResponses) {
            // Prompt user to choose from suggested responses
            return await stepContext.prompt(CHOICE_PROMPT, {
                prompt: 'Please choose from the following or type any follow up questions (type \'quit\' to end the conversation):',
                choices: [...res.detail.suggestedResponses.map((suggestedResponse) => suggestedResponse.text), 'Quit'],
                retryPrompt: 'Please choose from the following or type any follow up questions (type \'quit\' to end the conversation):'
            }); 
        }
        await stepContext.context.sendActivity('That\'s all I can do for you on this question. Ending the conversation. Type anything to start over.');
        return await stepContext.endDialog();
    }

    /**
     * Keep a dialog open until the user says "cancel" or "quit".
     * @param {*} stepContext 
     * @returns 
     */
    async isDialogComplete(stepContext) {
        let query = { }
        const answer = stepContext.result.value?.toLowerCase();
        console.log("answer: " + answer)
        if (!answer) {
            query = { text: 'What else can I do for you?' };
        } else if (answer === 'cancel' || answer === 'quit') {
            await stepContext.context.sendActivity('Ending the conversation. Type anything to start over.');
            return await stepContext.endDialog();
        } else {
            query = { text: answer, opts: stepContext.values.opts }
        }
        return await stepContext.replaceDialog(this.initialDialogId, query);
    }

}

module.exports.BingChatDialog = BingChatDialog;