# simplernotion

This project is a simpler way of using the Notion API to interact with your Notion space.

## **How to setup ?**

Execute this command in your terminal `npm install simplernotion`.

## Usage

### 1. Import the Module

First, import the module and initialize the Notion client:

```jsx
const NotionClient = require('simplernotion');
const client = new NotionClient('YOUR_INTEGRATION_TOKEN');
```

### 2. Query a Database

To query a Notion database, use the following function:

```jsx
const database = await client.query('database', 'YOUR_DATABASE_ID');
```

### 3. Create a Page

To create a new page in a Notion database, use the following code:

```jsx
const page = await database.pages.create({
  "Property Name": "Property content",
  "Title": "Page Title",
  "Number": 100,
  "Selection": ["Element"]
});
```

### 4. Update a Page

You can update the properties of an existing page as follows:

```jsx
page.update({
  "Title": "New Page Title"
});
```

### 5. Retrieve Users

To get users from your Notion workspace:

```jsx
const users = client.users.list();
```

## Contributing

If you'd like to contribute to this module, feel free to submit a pull request or open an issue to discuss improvements.
