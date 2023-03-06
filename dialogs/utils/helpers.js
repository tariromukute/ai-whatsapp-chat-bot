validateSuggestionChoice = async (promptContext) => {
    // TODO: Handle too many attempts, attemptCount > 2

    const text = promptContext.context._activity.text;
    // If the text is not a number set it as the value
    if(isNaN(text)) {
        console.log("The response is not a number");
        promptContext.recognized.succeeded = true;
        promptContext.recognized.value = { value: text };
        return true;
    }
    return promptContext.recognized.succeeded || false;
}

module.exports = {
    validateSuggestionChoice
}