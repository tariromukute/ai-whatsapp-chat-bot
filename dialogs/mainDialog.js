// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { MessageFactory, InputHints } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog, ChoicePrompt } = require('botbuilder-dialogs');
const { dialogs } = require('../config');
const { BingChatDialog } = require('./bingChatDialog');

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

const mainDialog = dialogs.MainDialog;

class MainDialog extends ComponentDialog {
    constructor(luisRecognizer) {
        super('MainDialog');

        if (!luisRecognizer) throw new Error('[MainDialog]: Missing parameter \'luisRecognizer\' is required');
        this.luisRecognizer = luisRecognizer;

        // Define the main dialog and its related components.
        // This is a sample "book a flight" dialog.
        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(new ChoicePrompt(mainDialog.prompts.INITIAL_PROMPT.id))
            .addDialog(new BingChatDialog(dialogs.BingChatDialog.name))
            .addDialog(new WaterfallDialog(mainDialog.name, [
                this.selectDialogStep.bind(this),
                this.startDialog.bind(this)
                // this.finalStep.bind(this)
            ]));

            this.initialDialogId = mainDialog.name;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    /**
     * First step in the waterfall dialog. Prompts the user to select dialog to start.
     * Currently only bing chat dialog is available.
     * @param {*} stepContext
     */
    async selectDialogStep(stepContext) {
        // Method is not used at the moment. It will be something like the code below when we have more dialogs
        return await stepContext.prompt(
            mainDialog.prompts.INITIAL_PROMPT.id, {
                prompt: mainDialog.prompts.INITIAL_PROMPT.message,
                choices: mainDialog.prompts.INITIAL_PROMPT.choices,
                retryPrompt: 'Not a valid option'
            }
        );
    }

    async startDialog(stepContext) {
        // When we have more dialog option this function will select dialog based on user input
        console.log("startDialog");
        const choices = mainDialog.prompts.INITIAL_PROMPT.choices;
        console.log(choices);
        // Retrieve the user input.
        const answer = stepContext.result.value?.toLowerCase();
        console.log(answer);
        if (!answer) {
            // exhausted attempts and no selection, start over
            await stepContext.context.sendActivity('Not a valid option. We\'ll restart the dialog ' +
                'so you can try again!');
            return await stepContext.endDialog();
        }
        else if (answer === choices[0].toLowerCase()) { // Search Bing
            console.log("bing");
            return await stepContext.beginDialog(dialogs.BingChatDialog.name);
        }
        else {
            console.log("else");
            // Restart the dialog.
            await stepContext.context.sendActivity('Not a valid option. We\'ll restart the dialog ' + 'so you can try again!');
            
            return await stepContext.replaceDialog(this.initialDialogId);
        }
    }

    /**
     * Final step in the main waterfall. Process the user's selection.
     * @param {*} stepContext
     */
    async finalStep(stepContext) {
        if (stepContext.result) {
            const resultMessage = stepContext.result;
            await stepContext.context.sendActivity(resultMessage, null, InputHints.IgnoringInput);
        }
        return await stepContext.endDialog();
    }

    
}

module.exports.MainDialog = MainDialog;
