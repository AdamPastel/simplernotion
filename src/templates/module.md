{gray}README.md{/gray}
# simplernotion
This project is a simpler way of using the Notion API to interact with your Notion space.
## **How to setup ?**
Execute this command in your terminal `{orange}npm{/orange} install simplernotion`.
## Usage
### 1. Initialize the Client
First, import the module and initialize the Notion client:
```javascript
const NotionClient = require('simplernotion');
const client = new NotionClient('YOUR_INTEGRATION_TOKEN');
```
### 2. Query a Database
To query a Notion database, use the following function:
```javascript
const database = await client.query('database', 'YOUR_DATABASE_ID');
```
### 3. Creating a Page with Properties and Markdown Content
To create a new page in a Notion database, use the following code:
```javascript
const properties = {
    Title: "My New Page",
    Status: ["Not Started"],
};

const markdownContent = `# Heading 1
This is **bold text** and //italic text// with __underline__ and ~~strikethrough~~.
Here's a code block:
\`\`\`javascript
console.log("Hello, Notion!");
\`\`\`
{blue}This text will appear blue in Notion.{/blue}`;

const newPage = await database.pages.create(properties, markdownContent);
console.log("New Page Created:", newPage.id);
```
### 4. Updating Page Properties
You can update the properties of an existing page as follows:
```javascript
const page = database.pages.cache.get('page-id');

const updatedProperties = {
	Title: "Updated Title",
    Status: ["In Progress"],
};

await page.update(updatedProperties);
console.log("Page updated with new properties");
```
### 5. Duplicating a Page
Duplicate an existing page along with its properties.
```javascript
const page = database.pages.cache.get('page-id');

const duplicatedPage = await page.duplicate();
console.log("Duplicated Page ID:", duplicatedPage.id);
```
### 6. Deleting a Page
To get users from your Notion workspace:
```javascript
const page = database.pages.cache.get('page-id');

await page.delete();
console.log("Page deleted");
```
### 7. Retrieve Users
To get users from your Notion workspace:
```javascript
const users = client.users.list();
```
## Contributing
If you'd like to contribute to this module, feel free to submit a pull request or open an issue to discuss improvements.