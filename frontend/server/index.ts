import express from 'express'
import cors from 'cors'
import boardRouter from './routes/board'
import columnsRouter from './routes/columns'
import cardsRouter from './routes/cards'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.use('/api', boardRouter)
app.use('/api/columns', columnsRouter)
app.use('/api/cards', cardsRouter)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
