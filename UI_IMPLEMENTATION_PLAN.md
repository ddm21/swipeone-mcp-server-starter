# UI Implementation Plan for SwipeOne MCP Tools

## Goal
Implement rich UI components for the SwipeOne MCP Server tools using the OpenAI Apps SDK guidelines. This ensures that tool outputs are presented to the user in a visually appealing and interactive way (Lists, Cards, etc.) rather than plain text.

## User Review Required
- **Frontend Architecture**: We assume we need to define these components conceptually or prepare the data structure. If a specific frontend codebase needs to be created (e.g. valid JSX/HTML components for the App), please confirm where that resides. This plan assumes we are defining the *mapping* and *data contracts*.
- **Interaction Model**: Confirm if "Edit" capabilities are required immediately, or if we start with "View-Only" components.

## Proposed Mappings

We will map the existing MCP tools to the following UI Component types found in `components.md`.

### 1. Contacts
| Tool | Component Type | Description |
|------|---------------|-------------|
| `retrieve_all_contacts` | **List** | Display contacts as a list. Each item shows Name, Email, and a "View" action. |
| `search_contacts` | **List** | Same as retrieve, but results are dynamic based on filter. |
| `get_contact_properties` | **Inline Card** | A simple card showing available properties (metadata) in a readable format (e.g. tags or small table). |

### 2. Notes
| Tool | Component Type | Description |
|------|---------------|-------------|
| `retrieve_notes` | **List** (or Carousel) | A list of recent notes. If notes are rich, a vertical list is best. Shows Title, Date, and snippet of Content. |
| `create_note` | **Inline Card** | Confirmation card displaying the created note's details. |
| `update_note` | **Inline Card** | Confirmation card displaying the updated note's details. |

### 3. Tasks
| Tool | Component Type | Description |
|------|---------------|-------------|
| `retrieve_all_tasks` | **List** | List of tasks showing Title, Due Date, and Status badge. |
| `create_task` | **Inline Card** | Confirmation card displaying the created task. |
| `update_task` | **Inline Card** | Confirmation card displaying the updated task. |

## Implementation Strategy

1.  **Standardize Responses**: Ensure tool handlers return structured JSON that matches the data requirements for these components.
    -   *Action*: Review `successResponse` in `src/utils/responseFormatter.ts` to ensure it passes raw data cleanly.
2.  **Define UI Manifest/Config**: Create a central definition (if applicable in the SDK context) or a reference doc `UI_COMPONENTS.md` that describes the JSON expected by the UI.

## Verification Plan
-   **Manual Testing**: Run the MCP tools locally and verify the JSON output structure matches the expected component input.
