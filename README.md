# simplernotion

This project is a simpler way of using the Notion API to interact with your Notion space.

## **How to setup ?**

Execute this command in your terminal `npm install simplernotion`.

## Usage

### 1. Initialize the Client

First, import the module and initialize the Notion client:

```jsx
const Notion = require('simplernotion');
const client = new Notion.Client('YOUR_INTEGRATION_TOKEN');
```

### 2. Query a Database

To query a Notion database, use the following function:

```jsx
const database = await client.query('database', 'YOUR_DATABASE_ID');
```

### 3. Creating a Page with Properties and Markdown Content

To create a new page in a Notion database, use the following code:

```jsx
const new_page = new Notion.PageBuilder()
    .setTitle("The Page Title")
    .setCover('https://website.com/url_to_image.png')
    .setIcon('👋')
    .setContent([
        new Notion.Heading()
            .setText('Heading Medium')
            .setType(Notion.HeadingType.Medium)
            .setColor(Notion.Colors.Orange),
        new Notion.Divider(),
        new Notion.Paragraph()
            .setText('Hello world!'),
        new Notion.Markdown()
            .setContent(`# Heading 1
This is **bold text** and //italic text// with __underline__ and ~~strikethrough~~.
Here's a code block:
\`\`\`javascript
console.log("Hello, Notion!");
\`\`\`
{blue}This text will appear blue in Notion.{/blue}`)
    ])
    .setProperties({
        Title: "My New Page",
        Status: ["Not Started"],
    })

await database.pages.create({ pages: [new_page] })
console.log("New Page Created with Success!");
```

### 4. Updating Page Properties

You can update the properties of an existing page as follows:

```jsx
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

```jsx
const page = database.pages.cache.get('page-id');

const duplicatedPage = await page.duplicate();
console.log("Duplicated Page ID:", duplicatedPage.id);
```

### 6. Deleting a Page

To delete a page from your Notion workspace:

```jsx
const page = database.pages.cache.get('page-id');

await page.delete();
console.log("Page deleted");
```

### 7. Retrieve Users

To get users from your Notion workspace:

```jsx
const myself = await client.users.fetch("my-notion-id");
const users = await client.users.list();
```

## Contributing

If you'd like to contribute to this module, feel free to submit a pull request or open an issue to discuss improvements.
