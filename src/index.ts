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

app.get('/', async (req: Request, res: Response) => {
  const comments = await prisma.comment.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      member: true
    },
  })
  // the person viewing the comments is the first member available
  const member = comments[0].member
  const newComments = comments.map(comment => {
    return {
      ...comment,
      createdAt: dayjs(comment.createdAt).fromNow(),
      canUpvote: member.id !== comment.member.id
    }
  })

  res.render('index', { comments: newComments, member })
})

app.post('/members/:id/comments', async (req: Request, res: Response) => {
  console.log(req.body)
  const memberId = req.params?.id
  const commentText = req.body as Omit<Comment, 'id' | 'createdAt'>
  try {
    await prisma.comment.create({
      data: {
        text: commentText.text,
        memberId: memberId
      }
    })
  } catch (error) {
    console.error(error)
  }

  res.redirect('/')
})

app.post('/members/:memberId/comments/:commentId/upvote', async (req: Request, res: Response) => {
  const memberId = req.params?.memberId
  const commentId = req.params?.commentId
  try {
    await prisma.upvote.create({
      data: {
        commentId,
        memberId
      }
    })

    res.sendStatus(200)
  } catch (error) {
    res.status(400).json({ error })
  }
})

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))
