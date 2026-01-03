# MCP Prompts

## Overview

MCP Prompts provide guidance to ChatGPT on how to effectively use your tools. They act as built-in instructions that help ChatGPT understand your tool capabilities and best practices.

## Available Prompts

### `swipeone_assistant`

Comprehensive guide for using SwipeOne CRM tools effectively.

**What it includes:**
- Overview of all tool capabilities
- Best practices for each tool category
- Common workflow examples
- Guidance on when to use which tool

## How It Works

When ChatGPT connects to your MCP server, it can:
1. List available prompts via `ListPromptsRequest`
2. Retrieve prompt content via `GetPromptRequest`
3. Use the prompt content to guide its responses

The prompt is automatically loaded and helps ChatGPT:
- Understand tool relationships
- Suggest appropriate workflows
- Ask for required information (like workspace IDs)
- Provide better assistance to users

## Customizing Prompts

Edit `src/prompts/definitions.ts` to customize the assistant prompt:

```typescript
export const swipeoneAssistantPromptContent = `
Your custom instructions here...
`;
```

## Adding New Prompts

1. Add prompt definition to `src/prompts/definitions.ts`
2. Add prompt content variable
3. Update `allPrompts` array
4. Add handler case in `src/index.ts`

Example:
```typescript
export const myCustomPrompt: Prompt = {
    name: 'my_custom_prompt',
    description: 'Description of what this prompt does',
    arguments: [],
};

export const myCustomPromptContent = `Your prompt content...`;

export const allPrompts: Prompt[] = [
    swipeoneAssistantPrompt,
    myCustomPrompt,
];
```

Then in `src/index.ts`:
```typescript
if (name === 'my_custom_prompt') {
    return {
        messages: [
            {
                role: 'user',
                content: {
                    type: 'text',
                    text: myCustomPromptContent,
                },
            },
        ],
    };
}
```
