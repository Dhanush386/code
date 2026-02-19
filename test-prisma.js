
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const id = 'cmltaym31000bja3g8b38cbnp';
  try {
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        levels: {
          include: {
            questions: {
              include: {
                question: true
              }
            }
          }
        }
      }
    });
    console.log('Exam:', JSON.stringify(exam, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
