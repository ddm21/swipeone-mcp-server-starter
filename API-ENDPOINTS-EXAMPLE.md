## API ENDPOINTS EXAMPLE


### BASE URL
```
https://api.swipeone.com/api/
```

### AUTHENTICATION - Header
```
x-api-key: YOUR_API_KEY
```



### Get All Contact Properties - DONE ✅

**Path Parameters** 
- `workspaceId` ( string | Required - Unique identifier of the workspace to fetch contact properties from. )

**Request**

```
GET /workspaces/{workspaceId}/contact-properties
```

**Example Response**

```json
{
  "status": "success",
  "data": {
    "count": 3,
    "contactProperties": [
      {
        "name": "firstName",
        "label": "First Name",
        "dataType": "string"
      },
      {
        "name": "lastName",
        "label": "Last Name",
        "dataType": "string"
      },
      {
        "name": "subscriptionStatus",
        "label": "Subscription Status",
        "dataType": "string"
      }
    ]
  }
}
```



### Search Contacts - DONE ✅

**Path Parameters** 
- `workspaceId` ( string | Required - Unique identifier of the workspace to fetch contact properties from. )

**Request**

```
POST /workspaces/:workspaceId/contacts/search
```

**Example Request Body**

```json
{
           "filter": {
             "type": "and",
             "predicates": [
               {
                 "property": "customProperties.subscriptionStatus",
                 "operator": "is",
                 "value": "in_trial",
                 "dataType": "string"
               },
               {
                 "property": "gender",
                 "operator": "is",
                 "value": "Female",
                 "dataType": "string"
               }
             ]
           },
           "limit": 10,
           "sort": [
             {
               "property": "fullName",
               "order": "asc"
             },
             {
               "property": "teamSize",
               "order": "dsc"
             }
           ],
           "searchAfter": "someToken",
           "searchBefore": "someToken"
         }
```

**Example Response**

```json
{
  "status": "success",
  "data": {
    "count": 200,
    "searchAfter": "someToken",
    "searchBefore": "someToken",
    "contacts": [
      {
        "name": "John Doe",
        "email": "john.doe@example.com"
      }
    ]
  }
}
```

**Pagination**
- This API uses cursor-based pagination with searchAfter and searchBefore tokens.
- Use searchAfter to get the next set of results.
- Use searchBefore to get the previous set of results.
- limit specifies the number of records per request (default: 10).

**Notes**
- Filtering is applied using logical conditions (and, or).
- Supports sorting results based on multiple properties.
- Ensure workspaceId is valid for successful results


--- NEW ENDPOINTS TO ADD ---


### Retrieve All Contacts - DONE ✅

**Path Parameters**
- `workspaceId` ( string | Required - The unique ID of the workspace from which to retrieve contacts. )

**Query Parameters**
- `searchText` ( string | Optional - Text to search in contacts (Name or Email). )
- `sort` ( string | Optional - Field to sort by (e.g., CreatedAt). )
- `order` ( integer | Optional - Sort order: 1 for ascending, -1 for descending (default is 1). )
- `searchAfter` ( string | Optional - Token to fetch the next set of results. )
- `searchBefore` ( string | Optional - Token to fetch the previous set of results. )
- `limit` ( integer | Optional - Number of contacts to return (default: 20). )

**Request**

```
GET /workspaces/:workspaceId/contacts
```

**Example Request**

```json
curl -X GET "https://api.swipeone.com/api/workspaces/6660175570fbd8a9c22bedfb/contacts?limit=10&sort=createdAt&order=1" \
     -H "x-api-key: YOUR_API_KEY"
```

**Example Response**

```json
{
  "status": "success",
  "data": {
    "count": 200,
    "searchAfter": "someToken",
    "searchBefore": "someToken",
    "contacts": [
      {
        "_id": "6682840d9286aa59ee3d4181",
        "firstName": "John",
        "lastName": "Doe",
        "fullName": "John Doe",
        "email": "john.doe@example.com",
        "phone": "123-456-7890",
        "createdAt": "2024-07-01T10:25:17.813Z",
        "updatedAt": "2024-07-01T10:25:17.813Z"
      }
    ]
  }
}
```

**Pagination**
- This API uses cursor-based pagination with searchAfter and searchBefore tokens.
- Use searchAfter to get the next set of results.
- Use searchBefore to get the previous set of results.
- limit specifies the number of records per request (default: 10).

**Notes**
- Filtering is applied using logical conditions (and, or).
- Supports sorting results based on multiple properties.
- Ensure workspaceId is valid for successful results


### Create a Note - DONE ✅

**Request**
```
POST /contacts/:contactId/notes
```

**Path/Request Parameters**
- `contactId` ( string | Required - The unique ID of the contact to which the note will be added. )

**Request Body Example**
```json
{
  "title": "Follow-up Call",
  "content": "Discussed pricing and features."
}
```

**Example Response**
```json
{
  "status": "success",
  "data": {
    "note": {
      "_id": "669b2c93efb8b213a7c72a8e",
      "title": "Follow-up Call",
      "content": "Discussed pricing and features.",
      "contactId": "6682840d9286aa59ee3d4181",
      "createdAt": "2024-07-01T10:25:17.813Z"
    }
  }
}
```


### Retrieve Notes for a Contact - DONE ✅

**Request**
```
GET /contacts/:contactId/notes
```

**Path/Request Parameters**
- `contactId` ( string | Required - The unique ID of the contact for which notes are to be retrieved. )

**Example Response**
```json
{
  "status": "success",
  "data": {
    "notes": [
      {
        "_id": "669b2c93efb8b213a7c72a8e",
        "title": "Follow-up Call",
        "content": "Discussed pricing and features.",
        "contactId": "6682840d9286aa59ee3d4181",
        "createdAt": "2024-07-01T10:25:17.813Z"
      }
    ]
  }
}
```


### Update a Note - DONE ✅

**Request**
```
PATCH /notes/:noteId
```

**Path/Request Parameters**
- `noteId` ( string | Required - The unique ID of the note to be updated. )

**Request Body Example**
```json
{
  "title": "Follow-up Call",
  "content": "Discussed pricing and features."
}
```

**Example Response**
```json
{
           "title": "Updated Meeting Notes",
           "content": "Added follow-up points and next steps."
         }
```

### Create a Task - TODO

**Request**
```
POST /workspaces/:workspaceId/tasks
```

**Path/Request Parameters**
- `workspaceId` ( string | Required - The unique ID of the workspace to which the task will be added. )

**Body Parameters**
- `name` ( string | Required - Name of the task. )
- `assignedTo` ( string | Optional - The user assigned to the task. )
- `dueDate` ( string | Optional - Due date of the task (ISO 8601 format). )
- `reminder` ( string | Optional - Reminder date for the task (ISO 8601 format). )
- `contactId` ( string | Optional - The contact associated with the task. )

**Request Body Example**
```json
{
  "name": "Follow up with John Doe",
  "assignedTo": "user123",
  "dueDate": "2024-07-10T12:00:00Z",
  "reminder": "2024-07-09T12:00:00Z",
  "contactId": "6682840d9286aa59ee3d4181"
}
```

**Example Response**
```json
{
  "status": "success",
  "data": {
    "task": {
      "_id": "669b2c93efb8b213a7c72a8e",
      "name": "Follow up with John Doe",
      "assignedTo": "user123",
      "dueDate": "2024-07-10T12:00:00Z",
      "reminder": "2024-07-09T12:00:00Z",
      "contactId": "6682840d9286aa59ee3d4181",
      "workspaceId": "6660175570fbd8a9c22bedfb",
      "createdAt": "2024-07-01T10:25:17.813Z",
      "updatedAt": "2024-07-01T10:25:17.813Z"
    }
  }
}
```

### Update a Task - TODO

**Request**
```
PATCH /tasks/:taskId
```

**Path Parameters**
- `taskId` ( string | Required - The unique ID of the task to be updated. )

**Request Body**
- `name` ( string | Optional - Updated name of the task. )
- `assignedTo` ( string | Optional - Updated assigned user. )
- `dueDate` ( string | Optional - Updated due date (ISO 8601 format). )
- `reminder` ( string | Optional - Updated reminder date (ISO 8601 format). )
- `status` ( string | Optional - Task status (not_started, in_progress, completed). )


**Request Body Example**
```json
{
  "name": "Updated Task Name",
  "status": "in_progress"
}
```

**Example Response**
```json
{
  "status": "success",
  "data": {
    "task": {
      "_id": "669b2c93efb8b213a7c72a8e",
      "name": "Updated Task Name",
      "assignedTo": "user123",
      "status": "in_progress"
      "dueDate": "2024-07-10T12:00:00Z",
      "reminder": "2024-07-09T12:00:00Z",
      "contactId": "6682840d9286aa59ee3d4181"
    }
  }
}
```


### Retrieve All Tasks (Paginated) - TODO

**Request**
```
GET /workspaces/:workspaceId/tasks
```

**Path/Request Parameters**
- `workspaceId` ( string | Required - The unique ID of the workspace for which tasks are to be retrieved. )

**Query Parameters**
- `page` ( integer | Optional - Page number for pagination (default: 1). )
- `limit` ( integer | Optional - Number of tasks to return (default: 20). )

**Example Request**
```json
GET /workspaces/6660175570fbd8a9c22bedfb/tasks?limit=10&sort=createdAt&order=1
```

**Example Response**
```json
{
  "status": "success",
  "data": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "tasks": [
      {
        "_id": "669b2c93efb8b213a7c72a8e",
        "name": "Follow up with John Doe",
        "assignedTo": "user123",
        "dueDate": "2024-07-10T12:00:00Z",
        "reminder": "2024-07-09T12:00:00Z",
        "status": "in_progress",
        "contactId": "6682840d9286aa59ee3d4181",
        "workspaceId": "6660175570fbd8a9c22bedfb",
        "createdAt": "2024-07-01T10:25:17.813Z",
        "updatedAt": "2024-07-01T10:25:17.813Z"
      }
    ]
  }
}
```


