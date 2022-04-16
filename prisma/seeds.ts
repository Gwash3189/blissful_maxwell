import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'

async function main() {
  try {
    const prisma = new PrismaClient()
    await prisma.upvote.deleteMany({})
    await prisma.comment.deleteMany({})
    await prisma.member.deleteMany({})

    const members = await Promise.all(new Array(5).fill(1).map(async () => {
      return await prisma.member.create({
        data: {
          avatar: 'https://www.coolgenerator.com/Pic/Face//male/male20101085925863250.jpg',
          name: faker.name.findName()
        }
      })
    }))

    await Promise.all(members.map(async (member) => {
      const length = faker.datatype.number({ min: 1, max: 5})
      console.log(`making ${length} comments for ${member.name}: ${member.id}`)
      return Promise.all(new Array(length).fill(1).map(async () => {
        return await prisma.comment.create({
          data: {
            text: faker.lorem.lines(faker.datatype.number({ min: 1, max: 5 })),
            memberId: member.id,
            createdAt: faker.date.past()
          }
        })
      }))
    })).then(x => x.flat())

    await prisma.member.findMany({
      include: {
        comments: true
      }
    }).then(members => {
      members.forEach(async (member) => {
        const commentIndex = faker.datatype.number({ min: 0, max: member.comments.length - 1 })
        console.log(`upvoting ${member.name}'s comment: ${member.comments[commentIndex].id}`)
        await prisma.upvote.create({
          data: {
            commentId: member.comments[commentIndex].id,
            memberId: member.id
          }
        })
      })
    })
  } catch (error) {
    console.log(error)
  }
}

main()
