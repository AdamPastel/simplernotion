const NotionClient = require('./index');

async function program() {
    const notion = new NotionClient("secret_qfFiYy2IChCMlPn4MbiPgaFpM2gfmZBmsHctUYqZMpk")
    const database = await notion.query('database', "3362f1488eb84950b2a530582a11f9ea")
    console.log(notion)
    // console.log(JSON.stringify(db))
    console.log(database)
    console.log(database.pages.cache.size)
    console.log(database.pages.cache)

    // console.log(database.pages.cache.get('1056a8d9-9922-805f-8469-def23cdb7c2f'))
    // console.log(database.pages.cache.find(page => page.icon === 'specific-icon'))
    // console.log(db.pages.cache.get())
    // console.log(db.pages.cache)
    // console.log(db.pages.cache.get('1056a8d9-9922-805f-8469-def23cdb7c2f'))

    
    await new Promise(resolve => setTimeout(resolve, 90000000))
}

program()