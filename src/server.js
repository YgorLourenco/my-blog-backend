const express = require('express')
const bodyParser = require('body-parser')
const {MongoClient} = require('mongodb')

//Modelo para o mongodb
// const articlesInfo = {
//     "aprenda-react": {
//         comments: [],
//     },
//     "aprenda-node": {
//         comments: [],
//     },
//     "meus-pensamentos-sobre-aprender-react": {
//         comments: [],
//     },
// }

const app = express()
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false }));

const withDb = async (operations, res) => {
    try {
        
        const client = await MongoClient.connect('mongodb://localhost:27017', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        })
        const db = client.db('myblog')
        await operations(db)
        client.close()
    } catch (error) {
        res.status(500).json({message: "Erro ao conectar com o Banco de dados", error})
    }
}

// Conectando os artigos criados com o banco de dados
app.get('/api/articles/:name', async (req, res) => {

        withDb(async (db) => {
            const articleName = req.params.name    
            const articleInfo = await db.collection('articles').findOne({name: articleName})
            res.status(200).json(articleInfo)
        }, res)
})

// Adiciona um comentário com nome e texto nos comentários
app.post('/api/articles/:name/add-comments', (req, res) => {
    
    const {username, text} = req.body
    const articleName = req.params.name

    withDb( async (db) => {
        const articleInfo = await db.collection('articles').findOne({name: articleName})
        await db.collection('articles').updateOne(
                {name: articleName}, 
                {
                $set: {
                    comments: articleInfo.comments.concat({username, text})
                },
            }
        )
        const updatedArticleInfo = await db.collection("articles").findOne({name: articleName})
        res.status(200).json(updatedArticleInfo)
    }, res)
    // articlesInfo[articleName].comments.push({username, text})
    // res.status(200).send(articlesInfo[articleName]) 
})

// Teste
// app.get('/hello', (req,res) => res.send('Hello'))
// app.post('/hello', (req, res) => res.send(`Hello ${req.body.name}`))
// app.get('/hello/:name', (req, res) => res.send(`Hello ${req.params.name}`))

app.listen(process.env.PORT || 8000, () => console.log('Servidor ligado na porta 8000'))