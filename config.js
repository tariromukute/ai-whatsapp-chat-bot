module.exports = {
    accessors: {
        REQUEST_PROPERTY_ACCESSOR: 'requestPropertyAccessor',
        CONVERSATION_PROPERTY_ACCESSOR: 'conversationPropertyAccessor',
        USER_PROPERTY_ACCESSOR: 'userPropertyAccessor',
        ACTIVE_AGENT_PROPERTY_ACCESSOR: 'activeAgentPropertyAccessor',
        ACTIVE_AGENT_CONVERSATION_PROPERTY_ACCESSOR: 'activeAgentConversationPropertyAccessor',
        TARGET_AGENT_PROPERTY_ACCESSOR: 'targetAgentPropertyAccessor',
        TARGET_CUSTOMER_PROPERTY_ACCESSOR: 'targetCustomerPropertyAccessor',
    },
    requests: {
        CHAT_TO_AGENT_REQUEST: 'chat to consultant'
    },
    dialogs: {
        MainDialog: {
            name: 'mainDialog',
            prompts: {
                INITIAL_PROMPT: {
                    id: 'initialPrompt',
                    message: 'What would you like to do?',
                    choices: [
                        'Search Bing',
                    ]
                }
            }
        },
        BingChatDialog: {
            name: 'bingChatDialog',
            prompts: {
                INITIAL_PROMPT: {
                    id: 'initialPrompt',
                    message: 'What would you like to search for?',
                },
                FINAL_PROMPT: {
                    id: 'finalPrompt',
                    message: 'What else can I help you with?',
                }
            }
        },
    }
};