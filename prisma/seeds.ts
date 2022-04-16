import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'

async function main() {
  try {
    const prisma = new PrismaClient()
    await prisma.upvote.deleteMany({})
    await prisma.comment.deleteMany({})
    await prisma.member.deleteMany({})

    const members = await Promise.all(new Array(5).fill(1).map(async () => {
      console.log('making a member')
      return await prisma.member.create({
        data: {
          avatar: 'https://www.coolgenerator.com/Pic/Face//male/male20101085925863250.jpg',
          name: faker.name.findName(),
          comments: {
            create: new Array(faker.datatype.number({ min: 1, max: 5 })).fill(1)
              .map(() => {
                console.log('making a comment')
                return { text: faker.lorem.lines(faker.datatype.number({ min: 1, max: 5 })) }
              })
          }
        },
        include: {
          comments: true
        }
      })
    }))



   await Promise.all(members.map(async(member) => {
     console.log('making an upvote', member.id, member.comments[0].id)
      return await prisma.upvote.create({
        data: {
          memberId: member.id,
          commentId: member.comments[0].id
        }
      })
    }))
  } catch (error) {
    console.log(error)
  }
}

main()
