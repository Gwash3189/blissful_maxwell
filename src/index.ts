import express from 'express'
import { Request, Response } from 'express'
import bodyParser from 'body-parser'
import { Comment, PrismaClient } from '@prisma/client'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativetime from 'dayjs/plugin/relativeTime'

const prisma = new PrismaClient()
const app = express()
const port = 3000

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('view engine', 'pug')
app.set('views', './src/views')
dayjs.extend(duration)
dayjs.extend(relativetime)

function page(pageNumber: string, pageSize: number) {
  const page = (pageNumber || '0') as string
  let skip = parseInt(page, 10)
  skip = (skip === 1 || skip <= 0) ? 0 : skip - 1
  skip = skip * pageSize

  return skip
}

app.get('/', async (req: Request, res: Response) => {
  const comments = await prisma.comment.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      member: true
    },
  })
  const newComments = comments.map(comment => ({ ...comment, createdAt: dayjs(comment.createdAt).fromNow() }))
  const member = newComments[0].member

  res.render('index', { comments: newComments, member })
})

app.get('/comments', async (req: Request, res: Response) => {
  const pageSize = 30

  const comments = await prisma.comment.findMany({
    skip: page((req.query?.page || '0') as string, pageSize)
  })

  res.json({ data: comments })
})

app.post('/members/:id/comments', async (req: Request, res: Response) => {
  const memberId = req.params?.id
  const commentText = req.body as Omit<Comment, 'id' | 'createdAt'>
  try {
    const comment = await prisma.comment.create({
      data: {
        text: commentText.text,
        memberId: memberId
      }
    })
    res.status(200).json({ data: comment })
  } catch (error) {
    res.status(400).json({ error })
  }
})

app.post('/members/:memberId/comments/:commentId/upvote', async (req: Request, res: Response) => {
  const memberId = req.params?.memberId
  const commentId = req.params?.commentId
  try {
    const upvote = await prisma.upvote.create({
      data: {
        commentId,
        memberId
      }
    })

    res.status(200).json({ data: upvote })
  } catch (error) {
    res.status(400).json({ error })
  }
})

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))
